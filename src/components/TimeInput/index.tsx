/** 时间选择 */

import { msFormat } from "@utils/helpers"
import { Picker } from "antd-mobile"
import { PickerValue } from "antd-mobile/es/components/picker"
import { useCallback } from "react"

export const basicColumns = [
  new Array(60).fill(0).map((_, i) => ({
    label: (i < 10 ? `0${i}` : String(i)) + '分',
    value: i
  })),
  new Array(60).fill(0).map((_, i) => ({
    label: (i < 10 ? `0${i}` : String(i)) + '秒',
    value: i
  })),
]

interface ITimeInput {
  value: number
  onChange(v: number): void
}
const TimeInput = (props: ITimeInput) => {
  const { value, onChange } = props;
  const timeValue = msFormat(value).split(':').map(Number);
  const setValue = useCallback((newValue: PickerValue[]) => {
    onChange((+newValue[0]! * 60 + +newValue[1]!) * 1000);
  }, [onChange]);
  return (
    <>
    <Picker
      columns={basicColumns}
      value={timeValue}
      onConfirm={setValue}
      onSelect={(val, extend) => {
        console.log('onSelect', val, extend.items)
      }}
    >
      {(_, { open }) => {
        return (
          <div onClick={open}>{msFormat(value)}</div>
        )
      }}
    </Picker>
    </>
  )
}

export default TimeInput