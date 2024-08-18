import './index.scss';
import AddBodyDataForm from "./add";
import BodyChart from "./chart";


const BodyData = () => {
  return (
    <div className="body-page">
      <div className="page-title">宝宝身材</div>
      <BodyChart />
      <AddBodyDataForm />
    </div>
  )
}



export default BodyData;
