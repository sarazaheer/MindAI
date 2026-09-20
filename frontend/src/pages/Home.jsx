import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import SpecialityMenu from "../components/SpecialityMenu";
import TopDoctors from "../components/TopDoctors";
import Banner from "../components/Banner";
import Loader from "../components/Loader";
import WelcomeModal from "../components/WelcomeModal";

const Home = () => {
  // Has this device ever finished the intro before?
  const isFirstVisit = !localStorage.getItem("mindai_visited");

  const [loading, setLoading] = useState(isFirstVisit);

  useEffect(() => {
    if (!isFirstVisit) return;

    // Simulates initial app/data readiness.
    // Replace this timeout with your real data-fetch promise if needed,
    // e.g. getDoctorsData().then(() => finishLoading());
    const timer = setTimeout(() => {
      localStorage.setItem("mindai_visited", "true");
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isFirstVisit]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {isFirstVisit && <WelcomeModal />}
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
};

export default Home;