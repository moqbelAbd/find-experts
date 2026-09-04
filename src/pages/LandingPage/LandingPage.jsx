import Hero from './Hero';
import './landingPage.css';
import LandingProcess from "./LandingProcess.jsx";
import LandingExpert from "./LandingExpert.jsx";

export default function LandingPage() {
    return (
        <div className="landing-page-wrapper">
            <Hero />
            <LandingProcess />
            <LandingExpert />
        </div>
    );
}