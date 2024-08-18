import Card, { SwitchBtn } from "@components/Card";
import { Canvas, Chart, Line, Axis, Legend } from '@antv/f2';
import { useEffect, useRef, useState } from "react";
import { bodyDb } from "./db";
import dayjs from "dayjs";
import { Range } from "@utils/database";


const Ranges = [
  { label: '7天', id: 'week' },
  { label: '30天', id: 'month' },
  { label: '1年', id: 'year' },
];

const BodyChartCard = (props: { axis: 'tall' | 'head' | 'weight', title: string }) => {
  const dom = useRef<HTMLCanvasElement>(null);
  const [range, setRange] = useState<string>(Ranges[1].id);
  const list = bodyDb.useDataBaseRange(range as Range, (rangeList) => {
    return {
      tall: rangeList[0].tall,
      head: rangeList[0].head,
      weight: rangeList[0].weight,
    }
  });

  useEffect(() => {
    const context = dom.current!.getContext("2d");
    const timeFmt = range === 'day' ? 'HH:mm' : 'MM-DD';
    const el = (
      // @ts-ignore
      <Canvas context={context} pixelRatio={window.devicePixelRatio}>
        <Chart data={list} >
          <Legend position="top" />
          <Axis field="timestamps" formatter={v => dayjs(v).format(timeFmt)} />
          <Axis field={props.axis} />
          <Line connectNulls x="timestamps" y={props.axis} />
        </Chart>
      </Canvas>
    )
    const chart = new Canvas(el.props);
    chart.render();
  }, [list, range]);


  return (
    <Card title={props.title} extra={
      <SwitchBtn
        value={range}
        options={Ranges}
        onChange={setRange}
      />
    }>
      <canvas style={{ width: "calc(100% - 12px)" }} ref={dom}></canvas>
    </Card>
  )
}

const BodyCharts = () => {
  return (
    <>
    <BodyChartCard title='长膘记录' axis="tall"/>
    <BodyChartCard title='长高记录' axis="weight"/>
    <BodyChartCard title='长头记录' axis="head"/>
    </>
  )
}

export default BodyCharts;
