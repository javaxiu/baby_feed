import Card, { SwitchBtn } from "@components/Card";
import { Canvas, Chart, Line, Point, Axis, Legend } from '@antv/f2';
import { useEffect, useMemo, useRef, useState } from "react";
import db from "../poop/db";
import dayjs from "dayjs";
import { Range } from "@utils/database";


const Ranges = [
  { label: '今天', id: 'day' },
  { label: '7天', id: 'week' },
  { label: '30天', id: 'month' },
];

const PoopChart = () => {
  const dom = useRef<HTMLCanvasElement>(null);
  const [range, setRange] = useState<string>(Ranges[1].id);
  const list = db.useDataBaseRange(range as Range, (rangeList) => {
    return {
      poop: rangeList.filter(x => x.type === 'poop').length,
      pee: rangeList.filter(x => x.type === 'pee').length,
    }
  });

  const renderList = useMemo(() => {
    const newList = [];
    for (const item of list.reverse()) {
      newList.push({
        type: 'poop',
        value: item.poop,
        timestamps: +dayjs(item.timestamps),
      }, {
        type: 'pee',
        value: item.pee,
        timestamps: +dayjs(item.timestamps),
      });
    }
    return newList;
  }, [list]);

  useEffect(() => {
    const context = dom.current!.getContext("2d");
    const timeFmt = range === 'day' ? 'HH:mm' : 'MM-DD';
    const color = {
      field: 'type',
      range: ['#f66f97', '#1890ff']
    };
    const el = (
      // @ts-ignore
      <Canvas context={context} pixelRatio={window.devicePixelRatio}>
        <Chart data={renderList} >
          <Legend position="top" />
          <Axis field="timestamps" formatter={v => dayjs(v).format(timeFmt)} />
          <Axis field="value" />
          <Line connectNulls x="timestamps" y="value" color={color}/>
          <Point x="timestamps" y="value" color={color} />
        </Chart>
      </Canvas>
    )
    const chart = new Canvas(el.props);
    chart.render();
  }, [list, range]);


  return (
    <Card title='噗噗记录' extra={
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

export default PoopChart;
