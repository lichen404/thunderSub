; ThunderSub - Custom NSIS Installer Configuration
; Clean, minimal installer for a premium feel
; Compatible with oneClick installer mode

; Branding text (bottom of installer window)
BrandingText "ThunderSub"

; Custom caption
Caption "ThunderSub Setup"

; --- Override installer finish page ---
; Show launch checkbox by default
!define AUTO_RUN "$INSTDIR\ThunderSub.exe"
