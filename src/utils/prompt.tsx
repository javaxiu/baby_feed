import { Dialog, DialogConfirmProps, Form } from "antd-mobile";
import { useEffect } from "react";

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

export const makeDetailDialog = <T,>(params: {
  title: string,
  fields: {label: string, name: string, render?(value: any): React.ReactNode}[],
  onDelete(item: T): void
}) => {
  const ValueField = ({value, render}: {value?: any, render?(v: any): React.ReactNode}) => render ? render(value) : value;
  const DataForm = (props: { value: T }) => {
    const [form] = Form.useForm<T>();
    useEffect(() => {
      form.setFieldsValue(props.value as any);
    }, [props.value]);
    return (
      <Form form={form} layout="horizontal" style={{ "--prefix-width": "3em" }}>
        {
          params.fields
            .map(field => (
              <Form.Item
                label={field.label}
                hidden={(props.value as any)[field.name] === undefined}
                name={field.name}>
                  <ValueField render={field.render}/>
              </Form.Item>
            ))
        }
      </Form>
    )
  }
  return (item: T) => {
    const dlg = Dialog.show({
      title: params.title,
      actions: [[
        {
          key: 'cancel',
          text: '关闭',
        },
        {
          key: 'delete',
          text: '删除',
          bold: true,
          danger: true,
        },
      ]],
      onAction(action) {
        dlg.close();
        if (action.key === 'delete') {
          params.onDelete(item);
        }
      },
      content: <DataForm value={item}/>,
    });
  };
}