import {FC} from "react";
import styled from "styled-components";


export type SubTableColumn = {
    dataIndex: string,
    name?: string,
    render?: (rowData: any, value: any) => any;
    width?: number
}

export type SubTableProps = {
    columns: SubTableColumn[],
    data: any[]
}

const TableWrapper = styled.table`
  > tbody {
    > tr {
      > td {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 12px;
      }
    }
  }
`

const SubTable: FC<SubTableProps> = ({columns, data}) => {
    return <TableWrapper>
        <thead>
        <tr>
            {columns.map((column) => <th key={column.dataIndex}
                                         style={column.width && {width: `${column.width}px`}}>{column.name}</th>)}
        </tr>
        </thead>
        <tbody>
        {
            data.map((rowData: any) => {
                return (
                    <tr>
                        {
                            columns.map((column) =>
                                <td>{column.render ? column.render(rowData, rowData[column.dataIndex]) : rowData[column.dataIndex]}</td>)
                        }
                    </tr>
                )
            })
        }
        </tbody>
    </TableWrapper>
}
export default SubTable;