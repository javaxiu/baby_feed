import Card, { SwitchBtn } from "@components/Card";
import { Canvas, Chart, Line, Point, Axis } from '@antv/f2';
import { useEffect, useRef, useState } from "react";
import { feedDataBase } from "../feed/db";
import dayjs from "dayjs";
import { MINUTE } from "@utils/helpers";
import { Range } from "@utils/database";


const Ranges = [
  { label: '今天', id: 'day' },
  { label: '7天', id: 'week' },
  { label: '30天', id: 'month' },
];

const FeedChart = () => {
  const dom = useRef<HTMLCanvasElement>(null);
  const [range, setRange] = useState<string>(Ranges[0].id);
  const list = feedDataBase.useDataBaseRange(range as Range, (rangeList) => {
    return {
      volume: rangeList.reduce((pre, cur) => pre + cur.volume, 0),
      count: rangeList.length,
    }
  });

  useEffect(() => {
    const context = dom.current!.getContext("2d");
    // const today = dayjs().startOf('day').valueOf();
    // const tonight = dayjs().endOf('day').valueOf();
    const timeFmt = range === 'day' ? 'HH:mm' : 'MM-DD';
    const el = (
      // @ts-ignore
      <Canvas context={context} pixelRatio={window.devicePixelRatio}>
        <Chart data={list.reverse()}>
          <Axis field="timestamps" tickCount={5} formatter={v => dayjs(v).format(timeFmt)} />
          <Axis field="volume" position="right" formatter={v => Math.ceil(v / MINUTE)}/>
          <Axis field="count"/>
          <Line x="timestamps" y="volume" />
          <Point x="timestamps" y="volume" />
          <Line x="timestamps" y="count" color="green"/>
          <Point x="timestamps" y="count" color="green"/>
        </Chart>
      </Canvas>
    )
    const chart = new Canvas(el.props);
    chart.render();
  }, [list, range]);


  return (
    <Card title='嘬嘬记录' extra={
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

export default FeedChart;
