import { Dialog, DialogConfirmProps, Form } from "antd-mobile";
import { FormInstance } from "antd-mobile/es/components/form";
import { createElement, createRef, forwardRef, useEffect, useImperativeHandle } from "react";

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
  fields: {label: string, name: string, render?(value: any): React.ReactNode, editor?: React.ComponentType<any>}[],
  onDelete(item: T): void,
  onSubmit?(item: T): void
}) => {
  const ValueField = ({value, render}: {value?: any, render?(v: any): React.ReactNode}) => render ? render(value) : value;
  const DataForm = forwardRef((props: { value: T }, ref) => {
    const [form] = Form.useForm<T>();
    useEffect(() => {
      form.setFieldsValue(props.value as any);
    }, [props.value]);
    useImperativeHandle(ref, () => form);
    return (
      <Form form={form} layout="horizontal" style={{ "--prefix-width": "calc(4em + 12px)" }}>
        {
          params.fields
            .map(field => (
              <Form.Item
                style={{"--padding-left": "6px"} as any}
                label={field.label}
                hidden={(props.value as any)[field.name] === undefined}
                name={field.name}>
                  {
                    field.editor ? createElement(field.editor) : <ValueField render={field.render}/>
                  }
              </Form.Item>
            ))
        }
      </Form>
    )
  });
  return (item: T) => {
    const formRef = createRef<FormInstance>();
    const dlg = Dialog.show({
      title: params.title,
      actions: [[
        {
          key: 'cancel',
          text: '关闭',
        },
        {
          key: 'submit',
          text: '修改',
        },
        {
          key: 'delete',
          text: '删除',
          bold: true,
          danger: true,
        },
      ].filter(act => {
        return act.key !== 'submit' || params.onSubmit
      })],
      onAction(action) {
        dlg.close();
        if (action.key === 'delete') {
          params.onDelete(item);
        }
        if (action.key === 'submit') {
          params.onSubmit?.({
            ...item,
            ...formRef.current?.getFieldsValue()
          });
        }
      },
      content: <DataForm value={item} ref={formRef}/>,
    });
  };
}