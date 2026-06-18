import { EventEmitter } from 'node:events';
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Readable, Transform } from 'node:stream';
import { randomUUID } from 'node:crypto';
import type { DownloadTask, SubtitleItem } from '../../shared/types';
import { HttpClient } from '../network/httpClient';

type AddTaskInput = {
  subtitle: SubtitleItem;
  videoPath: string;
  savePath: string;
};

export class DownloadQueue extends EventEmitter {
  private readonly tasks: DownloadTask[] = [];
  private running = 0;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly concurrency: number
  ) {
    super();
  }

  list(): DownloadTask[] {
    return [...this.tasks];
  }

  remove(videoPath: string, subtitleId: string): boolean {
    const index = this.tasks.findIndex(
      (t) => t.videoPath === videoPath && t.subtitle.id === subtitleId
    );
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    this.emit('update', this.list());
    return true;
  }

  add(input: AddTaskInput): DownloadTask {
    const now = new Date().toISOString();
    const task: DownloadTask = {
      id: randomUUID(),
      subtitle: input.subtitle,
      videoPath: input.videoPath,
      savePath: input.savePath,
      status: 'pending',
      progress: 0,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.unshift(task);
    this.emit('update', this.list());
    void this.pump();
    return task;
  }

  private async pump(): Promise<void> {
    while (this.running < this.concurrency) {
      const pending = this.tasks.find((task) => task.status === 'pending');
      if (!pending) return;
      this.running += 1;
      void this.run(pending).finally(() => {
        this.running -= 1;
        void this.pump();
      });
    }
  }

  private async run(task: DownloadTask): Promise<void> {
    task.status = 'running';
    task.updatedAt = new Date().toISOString();
    this.emit('update', this.list());

    try {
      await mkdir(task.savePath.replace(/\\[^\\]+$/, ''), { recursive: true });
      const response = await this.httpClient.request(task.subtitle.downloadUrl, { method: 'GET' });
      if (!response.ok || !response.body) {
        throw new Error(`Download failed with HTTP ${response.status}`);
      }

      const total = Number(response.headers.get('content-length') ?? 0);
      let loaded = 0;
      const updateProgress = new Transform({
        transform(chunk, _encoding, callback) {
          loaded += chunk.length;
          if (total > 0) {
            task.progress = Math.min(100, Math.round((loaded / total) * 100));
            task.updatedAt = new Date().toISOString();
          }
          callback(null, chunk);
        }
      });

      await pipeline(
        Readable.fromWeb(response.body as any),
        updateProgress,
        createWriteStream(task.savePath)
      );
      task.progress = 100;
      task.status = 'success';
      task.updatedAt = new Date().toISOString();
      this.emit('update', this.list());
    } catch (error) {
      task.status = 'failed';
      task.error = (error as Error).message;
      task.updatedAt = new Date().toISOString();
      this.emit('update', this.list());
    }
  }
}

