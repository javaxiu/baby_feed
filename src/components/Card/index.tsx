import classNames from 'classnames';
import './index.scss';

const Card = (props: { title: string, extra: React.ReactElement, children: any }) => {
  return (
    <div className='card'>
      <div className='card-title'>{props.title} <div className='card-title-extra'>{props.extra}</div></div>
      <div className='card-body'>{props.children}</div>
    </div>
  )
}

export const SwitchBtn = (props: {
  options: { label: string, id: string }[],
  value: string
  onChange(id: string): void
}) => {
  return (
    <div className='switch-btn'>
      {
        props.options.map((item) => (
          <div
            className={classNames({ active: item.id === props.value })}
            key={item.id}
            onClick={() => props.onChange(item.id)}
          >
            {item.label}
          </div>
        ))
      }
    </div>
  )
}

export default Card;