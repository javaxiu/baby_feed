import classNames from 'classnames';
import './index.scss';

export const ButtomButton = ({ className, children }: { className?: string, children: any }) => {
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
  type?: 'square' | 'cicle'
}) => (
  <div
    className={classNames(
      props.type === 'square' ? 'square-button' : 'circle-button',
      { border: props.border },
      props.className
    )}
    onClick={props.onClick}>
      {props.children}
  </div>
)
