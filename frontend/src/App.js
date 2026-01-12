import React, { useState } from 'react';
import VenueList from './components/VenueList';
import UserProfile from './components/UserProfile';

function App() {

    const [isUserLoggedIn, setIsUserLoggedIn] = useState(!!localStorage.getItem('token'));
    const [view, setView] = useState('venues'); // 'venues' | 'profile'

    return (
        <div className="App">
            <div style={{ textAlign: 'right', padding: '1rem', background: '#f5f5f5' }}>
                <button onClick={() => setView('venues')} style={{marginRight: '10px'}}>Майданчики</button>
                <button onClick={() => setView('profile')}>Профіль</button>
            </div>

            {view === 'venues' && (
                <VenueList
                    setView={setView}
                    isUserLoggedIn={isUserLoggedIn}
                    setIsUserLoggedIn={setIsUserLoggedIn}
                />
            )}

            {view === 'profile' && (
                isUserLoggedIn ? (
                    <UserProfile setIsUserLoggedIn={setIsUserLoggedIn} setView={setView} />
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                        <h2>Ви не авторизовані</h2>
                        <p>Будь ласка, увійдіть у систему на сторінці майданчиків.</p>
                        <button onClick={() => setView('venues')}>Перейти до входу</button>
                    </div>
                )
            )}
        </div>
    );
}

export default App;