import Navbar from '../app/components/Navbar';
import Main from '../app/components/Main';
import { Footer } from '../app/components/Footer';
import DashboardUi from './components/DashboardUi';


export default function Home() {
  return (
  <>
   <Navbar />
         <div className="mt-20">
        <Main />
        <DashboardUi />
      </div>
      <div className=''>
      <Footer />
      </div>
  </>

  );
}