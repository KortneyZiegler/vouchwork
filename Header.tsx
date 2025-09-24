import React from 'react';
import { CommunityIcon } from './icons/CommunityIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

type View = 'jobList' | 'profile' | 'postGig' | 'myGigs' | 'applicantProfile';
type AuthView = 'landing' | 'auth';

interface HeaderProps {
    isAuthenticated: boolean;
    currentView?: View;
    setView?: (view: View) => void;
    onLogout?: () => void;
    setAuthView?: (view: AuthView) => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, currentView, setView, onLogout, setAuthView }) => {
    const activeClasses = "text-primary-700 border-b-2 border-primary-700 font-semibold";
    const inactiveClasses = "text-gray-500 hover:text-gray-800 font-medium";

    const handleLogoClick = () => {
        if (isAuthenticated && setView) {
            setView('jobList');
        } else if (!isAuthenticated && setAuthView) {
            setAuthView('landing');
        }
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoClick}>
                    <CommunityIcon className="h-8 w-auto text-primary-700" />
                    <span className="text-2xl font-bold text-primary-700">
                        VouchWork SA
                    </span>
                </div>
                {isAuthenticated ? (
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex items-center space-x-6">
                            <button
                                onClick={() => setView && setView('jobList')}
                                className={`pb-1 transition-colors duration-200 ${currentView === 'jobList' ? activeClasses : inactiveClasses}`}
                            >
                                Browse Gigs
                            </button>
                            <button
                                onClick={() => setView && setView('myGigs')}
                                className={`pb-1 transition-colors duration-200 ${currentView === 'myGigs' ? activeClasses : inactiveClasses}`}
                            >
                                My Gigs
                            </button>
                            <button
                                onClick={() => setView && setView('profile')}
                                className={`pb-1 transition-colors duration-200 ${currentView === 'profile' ? activeClasses : inactiveClasses}`}
                            >
                                My Profile
                            </button>
                        </nav>
                        <div className="flex items-center gap-4">
                             <button
                                onClick={() => setView && setView('postGig')}
                                className="flex items-center gap-2 bg-primary-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800 transition-all duration-200 transform hover:scale-105"
                            >
                                <PlusCircleIcon className="h-5 w-5" />
                                <span className="hidden sm:inline">Post a Gig</span>
                            </button>
                             <button
                                onClick={onLogout}
                                className="hidden sm:block bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <button onClick={() => setAuthView && setAuthView('auth')} className="bg-primary-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-800">
                            Login / Sign Up
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;