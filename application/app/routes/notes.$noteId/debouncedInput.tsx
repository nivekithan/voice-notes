import { TextareaAutosizeProps } from "react-textarea-autosize";
import { useDebounceFetcher } from "./useDebounceFetcher";
import AutosizeTextArea from "react-textarea-autosize";

export function DebouncedInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  const fetcher = useDebounceFetcher();

  return (
    <input
      {...props}
      onChange={(e) => {
        fetcher.debounceSubmit(e.currentTarget.form, {
          replace: true,
          debounceTimeout: 200,
        });
      }}
      onBlur={(e) => {
        fetcher.debounceSubmit(e.currentTarget.form, { replace: true });
      }}
    />
  );
}

export function DebouncedAutosizeTextArea(props: TextareaAutosizeProps) {
  const fetcher = useDebounceFetcher();

  return (
    <AutosizeTextArea
      {...props}
      onChange={(e) => {
        fetcher.debounceSubmit(e.currentTarget.form, {
          replace: true,
          debounceTimeout: 200,
        });
      }}
      onBlur={(e) => {
        fetcher.debounceSubmit(e.currentTarget.form, { replace: true });
      }}
    />
  );
}
