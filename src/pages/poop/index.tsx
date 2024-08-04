import { Dialog, Form, Input, Radio, Space } from 'antd-mobile';
import type { FormInstance } from 'antd-mobile/es/components/form';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { createRef, useCallback, useMemo } from 'react';
import poopGif from '../../assets/poop.gif';
import { ButtomButton, Button } from '../../components/Button';
import db, { Color, PoopRecord, Smell, Style } from './db';
import './index.scss';
import { asyncPrompt } from '../../utils/prompt';
import TimePicker, { TimePickerRef } from '../../components/TimePicker';

const formFields = [
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


export default () => {
  const { list, add, remove } = db.useDataBaseList();
  const createRecord = useCallback(async () => {
    const data = await createPrompt();
    if (!data) return true;
    add({...data, type: 'poop', time: Date.now()});
    return true;
  }, []);
  const creatRecordPee = useCallback(async () => {
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
    add({ type: 'pee', time: ref.current!.getValue() } as any) 
  }, []);
  const reverseList = useMemo(() => ([...list].reverse()), [list]);
  return (
    <div className='poop-page'>
      <img src={poopGif} />
      <div className='poop-page-list'>
        <div className='poop-page-list-mask'>
          <ol>
            {
              reverseList.map(item => (
                <li>
                  <div>
                    <div>{dayjs(item.time).format('MM-DD HH:mm')}</div>
                    {
                      item.type === 'pee' ? (
                        <div>放了一泡水</div>
                      ) : (
                        <>
                        <div style={{ color: item.color }}>{Color[item.color]}</div>
                        <div>{Smell[item.smell]}</div>
                        <div>{Style[item.style]}</div>
                        </>
                      )
                    }
                    <div onClick={() => remove(item)}>删除</div>
                  </div>
                </li>
              ))
            }
          </ol>
        </div>
      </div>
      
      <ButtomButton className='poop-page-btns'>
        <Button onClick={createRecord}>💩</Button>
        <Button className='poop-page-btns-pee' border onClick={creatRecordPee}>🍺</Button>
      </ButtomButton>
    </div>
  );
}