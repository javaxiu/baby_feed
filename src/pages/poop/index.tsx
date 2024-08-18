import poopGif from '@assets/poop.gif';
import { makeDetailDialog } from '@utils/prompt';
import dayjs from 'dayjs';
import db, { Color, PeepRecord, PoopRecord, Smell, Style } from './db';
import './index.scss';
import Add, { formFields } from './Add';


const showDetail = makeDetailDialog<PoopRecord | PeepRecord>({
  title: '噗噗记录',
  fields: [
    { label: '时间', name: 'timestamps', render: v => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { label: '类型', name: 'type', render: v => v === 'pee' ? '嘘嘘🍺' : '💩粑粑' },
    ...formFields.map(field => ({
      label: field.label,
      name: field.key,
      render: (v: string) => {
        return (
          <span style={field.key === 'color' ? { color: v } : {}}>
            {(field.options as Record<string, string>)[v]}
          </span>
        )
      }
    })),
    { label: '备注', name: 'remark' }
  ],
  onDelete(item) {
    db.remove(item as any);
  }
});


export default () => {
  const list = db.useDataBaseRange({ n: 3, unit: 'day' });
  
  return (
    <div className='poop-page'>
      <img src={poopGif} />
      <div className='poop-page-list'>
        <div className='poop-page-list-mask'>
          <ol>
            {
              list.map(item => (
                <li key={item.id} onClick={() => showDetail(item)}>
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
                  </div>
                </li>
              ))
            }
          </ol>
        </div>
      </div>
      <Add />
    </div>
  );
}