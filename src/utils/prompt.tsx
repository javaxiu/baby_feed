import { Dialog, DialogConfirmProps } from "antd-mobile";

export const asyncPrompt = <Ok=true, No=false>(props: DialogConfirmProps & { okKey?: Ok, noKey?: No }) => {
  return new Promise<Ok | No>((resolve) => {
    Dialog.confirm({
      ...props,
      onConfirm() {
        resolve(props.okKey || true as Ok);
      },
      onCancel() {
        resolve(props.noKey || false as No);
      }
    })
  });
}