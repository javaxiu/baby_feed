import { CalendarPicker, Form, Input, Popup } from 'antd-mobile';
import dayjs from 'dayjs';
import { memo, useEffect, useState, useCallback } from 'react';
import { bodyDb } from './db';
import { Button } from '@components/Button';


const WeightInput = memo((props: {
  value?: number,
  onChange?(value: number): void
}) => {
  type Data = { total: number, mon: number, baby: number, baby_: number };
  const [form] = Form.useForm<Data>();
  const onChange = (_: any, allValues: any) => {
    const newValue: Data = Object.keys(allValues).reduce((pre, cur) => ({ ...pre, [cur]: +allValues[cur] || 0 }), {} as Data);
    newValue.baby = allValues.total - allValues.mon;
    newValue.baby_ = newValue.baby * 2; 
    form.setFieldsValue(newValue);
    props.onChange?.(newValue.baby);
  }
  useEffect(() => {
    form.setFieldsValue({ total: 0, mon: 0, baby: 0, baby_: 0 });
  }, []);
  return (
    <div className="weight-input">
      <Form layout="horizontal" className="weight-input-form" onValuesChange={onChange} form={form}>
        <Form.Item name="total" label="一起称" extra="kg"><Input type="number" step={0.01} /></Form.Item>
        <Form.Item name="mon" label="妈妈体重" extra="kg"><Input type="number" step={0.01} /></Form.Item>
        <Form.Item name="baby" label="宝宝的体重" extra="kg"><Input type="number" step={0.01} /></Form.Item>
        <Form.Item name="baby_" label="宝宝的体重" extra="斤"><Input type="number" step={0.01} /></Form.Item>
      </Form>
    </div>
  )
})

const DateInput = (props: {
  value?: number,
  placeholder: string
  onChange?(v: number): void
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
    {
      props.value ? (
        <div className="date-input-value" onClick={() => setVisible(true)}>{dayjs(props.value).format('YYYY年MM月DD日')}</div>
      ) : (
        <div className="date-input-placeholder" onClick={() => setVisible(true)}>{props.placeholder}</div>
      )
    }
    <CalendarPicker
      visible={visible}
      onClose={() => setVisible(false)}
      selectionMode='single'
      defaultValue={new Date()}
      value={new Date(props.value || Date.now())}
      onChange={date => props.onChange!(date?.valueOf() || Date.now())}
    />
    </>
  )
}

const BodyData = ({ close }: { close(): void }) => {
  const [form] = Form.useForm<{ tall: number, head: number, weight: number, date: number }>();
  
  const add = useCallback(() => {
    const values = form.getFieldsValue();
    const time = values.date || Date.now();
    bodyDb.add({
      tall: +values.tall,
      head: +values.head,
      weight: +values.weight,
      id: time,
      timestamps: time,
    });
    close();
  }, [close]);

  return (
    <div>
      <Form layout="horizontal" className="body-page-form" form={form}>
        <Form.Item name="tall" label="身高" extra="cm">
          <Input type="number" step={0.01} placeholder="宝宝多高了呀"/>
        </Form.Item>
        <Form.Item name="head" label="头围" extra="cm">
          <Input type="number" step={0.01} placeholder="宝宝我呀的头都大了"/>
        </Form.Item>
        <Form.Item name="weight" label="体重" extra={"kg"}>
          <WeightInput />
        </Form.Item>
        <Form.Item name="date" label="日期">
          <DateInput placeholder="什么时候的呀(不选就今天了喔)"/>
        </Form.Item>
      </Form>
      <div className="body-page-submit-wrap">
        <Button type="square" onClick={add}>记录</Button>
      </div>
    </div>
  )
}

const AddBodyDataForm = () => {
  const [visible, setVisible] = useState(false);
  return (
    <>
    <Popup visible={visible} closeOnMaskClick onClose={() => setVisible(false)}>
      <BodyData close={() => setVisible(false)}/>
    </Popup>
    <Button type='bottom-right' onClick={() => setVisible(true)}>+</Button>
    </>
  )
}

export default AddBodyDataForm;
