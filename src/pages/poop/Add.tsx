import { BottomButton, ButtonGroup, Button } from "@components/Button"
import TimePicker, { TimePickerRef } from "@components/TimePicker";
import { ID_TS_FMT } from "@utils/helpers";
import { asyncPrompt } from "@utils/prompt";
import { Dialog, Form, Input, Radio, Space } from "antd-mobile"
import dayjs from "dayjs";
import { useCallback, createRef } from "react";
import db, { Color, PoopRecord, Smell, Style } from "./db";
import { FormInstance } from "antd-mobile/es/components/form";
import classNames from "classnames";

export const formFields = [
  {
    label: '颜色',
    key: 'color',
    options: Color,
  },
  {
    label: '气味',
    key: 'smell',
    options: Smell,
  },
  {
    label: '外观',
    key: 'style',
    options: Style,
  },
]

const createPrompt = () => {
  return new Promise<PoopRecord | null>((resolve) => {
    const form = createRef<FormInstance>();
    const onConfirm = () => {
      const values = form.current!.getFieldsValue(true);
      resolve(values);
      dialogInstance?.close();
    }
    const onCancel = () => {
      resolve(null);
      dialogInstance?.close();
    }
    const initialValues = formFields.reduce((prev, field) => ({
      ...prev,
      [field.key]: Object.keys(field.options)[0]
    }), {});
    const dialogInstance = Dialog.show({
      className: 'poop-page-dialog',
      title: "这次的爆米花是啥口味😎" ,
      content: (
        <Form className='poop-page-dialog-form' ref={form} initialValues={initialValues}>
          {
            formFields.map(field => (
              <Form.Item label={field.label} name={field.key}>
                <Radio.Group>
                  <Space wrap>
                  {
                    Object.keys(field.options).map(k => (
                      <Radio
                        value={k}
                        className={classNames(
                          'poop-page-dialog-form-radio',
                          field.key,
                        )}
                        style={{ '--value': k } as any}
                      >
                        {(field.options as any)[k]}
                      </Radio>
                    ))
                  }
                  </Space>
                </Radio.Group>
              </Form.Item>
            ))
          }
          <Form.Item name="time" label="时间">
            <TimePicker placeholder='啥时候拉的(不填就是现在)' />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input placeholder='战况如何'/>
          </Form.Item>
        </Form>
      ),
      actions: [[
        { key: 'cancel', text: '没拉呀😷', onClick: onCancel },
        { key: 'confirm', text: '打包!🤮', onClick: onConfirm },
      ]],
    });
  });
}

const Add = () => {
  
  const createRecord = useCallback(async () => {
    const data = await createPrompt();
    if (!data) return true;
    db.add({...data, id: dayjs(data.time).format(ID_TS_FMT), timestamps: data.time || Date.now(), type: 'poop' });
    return true;
  }, []);

  const createRecordPee = useCallback(async () => {
    const ref = createRef<TimePickerRef>();
    const yes = await asyncPrompt({
      title: "宝宝尿了哦?",
      content: (
        <div>
          <TimePicker ref={ref} placeholder='啥时候尿的嘛' border/>
        </div>
      ),
      confirmText: "是呀",
      cancelText: "你才尿了呢"
    });
    if (!yes) return;
    const v = ref.current!.getValue();
    db.add({
      id: Date.now(),
      timestamps: v,
      type: 'pee',
      time: v
    }); 
  }, []);
  return (
    <>
    <BottomButton className='poop-page-btns'>
      <ButtonGroup>
        <Button onClick={createRecord} type='square'>💩&nbsp;&nbsp;粑粑</Button>
        <Button className='poop-page-btns-pee' type='square' onClick={createRecordPee}>嘘嘘  🍺</Button>
      </ButtonGroup>
    </BottomButton>
    </>
  )
}

export default Add;
