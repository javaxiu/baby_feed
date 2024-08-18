import classNames from 'classnames';
import './index.scss';

export const BottomButton = ({ className, children }: { className?: string, children: any }) => {
  return (
    <div className={classNames('bottom-button', className)}>
      {children}
    </div>
  )
}

export const Button = (props: {
  className?: string,
  border?: boolean,
  onClick?(): any,
  children: any,
  type?: 'square' | 'circle' | 'bottom-right'
}) => (
  <div
    className={classNames(
      {
        "square-button": props.type === 'square',
        "circle-button": props.type === 'circle',
        "circle-button bottom-right": props.type === 'bottom-right',
      },
      { border: props.border },
      props.className,
    )}
    onClick={props.onClick}>
      {props.children}
  </div>
)

export const ButtonGroup = (props: {children: any}) => {
  return (
    <div className='button-group'>
      {props.children}
    </div>
  )
}
