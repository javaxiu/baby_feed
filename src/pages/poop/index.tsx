import { createRef, useCallback } from 'react';
import poopGif from '../../assets/poop.gif';
import { ButtomButton, Button } from '../../components/Button';
import './index.scss';
import db, { PoopRecord } from './db';
import { Dialog, Form, Radio, Space } from 'antd-mobile';
import { Color, Smell, Style } from './db';
import classNames from 'classnames';
import { FormInstance } from 'antd-mobile/es/components/form';
import dayjs from 'dayjs';

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
    add({...data, time: Date.now()});
    return true;
  }, []);
  return (
    <div className='poop-page'>
      <img src={poopGif} />
      <div className='poop-page-list'>
        <div className='poop-page-list-mask'>
          <ol>
            {
              list.reverse().map(item => (
                <li>
                  <div>
                    <div>{dayjs(item.time).format('MM-DD HH:mm')}</div>
                    <div>{Color[item.color]}</div>
                    <div>{Smell[item.smell]}</div>
                    <div>{Style[item.style]}</div>
                    <div onClick={() => remove(item)}>删除</div>
                  </div>
                </li>
              ))
            }
          </ol>
        </div>
      </div>
      
      <ButtomButton className='buttom-button'>
        <Button onClick={createRecord}>+</Button>
      </ButtomButton>
    </div>
  );
}