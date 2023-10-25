/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare" />
/// <reference types="@cloudflare/workers-types" />

declare module "react-audio-visualize" {
  export function LiveAudioVisualizer(props: {
    mediaRecorder: MediaRecorder;
    width?: number;
    heigth?: number;
    barWidth?: number;
    gap?: number;
    backgroundColor?: string;
    barColor?: string;
  }): React.ReactNode;
}
