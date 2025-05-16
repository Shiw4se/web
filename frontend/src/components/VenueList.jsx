import React, { useEffect, useState } from 'react';
import './VenueList.css';

const VenueList = () => {
    const [venues, setVenues] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [typeFilter, setTypeFilter] = useState('');
    const [showMenu, setShowMenu] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    const [editingVenue, setEditingVenue] = useState(null);
    const [formData, setFormData] = useState({ name: '', location: '', type: '' });

    useEffect(() => {
        fetch('/api/venue/get_all')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setVenues(data);
                setFiltered(data);
            })
            .catch(err => console.error('Error fetching venues:', err));
    }, []);

    const uniqueTypes = [...new Set(venues.map(v => v.type))];

    const handleTypeSelect = (type) => {
        setTypeFilter(type);
        setShowMenu(false);
        if (type === '') {
            setFiltered(venues);
        } else {
            setFiltered(venues.filter(v => v.type.toLowerCase().includes(type.toLowerCase())));
        }
    };

    const handleLoginChange = (e) => {
        console.log('login input change:', e.target.name, e.target.value);
        setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = (e) => {
        e.preventDefault();
        fetch('/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        })
            .then(res => {
                if (!res.ok) throw new Error(`Login failed: ${res.status}`);
                return res.json();
            })
            .then(data => {
                localStorage.setItem('token', data.token);
                setIsAdmin(true);
                setShowLoginForm(false);
            })
            .catch(err => alert('Помилка входу: ' + err.message));
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditClick = (venue) => {
        setEditingVenue(venue);
        setFormData({
            name: venue.name,
            location: venue.location,
            type: venue.type,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        fetch(`/api/venue/update/${editingVenue.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        })
            .then(res => {
                if (!res.ok) throw new Error(`Update failed with status ${res.status}`);
                return res.json();
            })
            .then(updated => {
                const updatedList = venues.map(v => v.id === updated.id ? updated : v);
                setVenues(updatedList);
                setFiltered(updatedList);
                setEditingVenue(null);
            })
            .catch(err => console.error('Update failed:', err));
    };

    const handleAdd = () => {
        const token = localStorage.getItem('token');

        fetch('/api/venue/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        })
            .then(res => {
                if (!res.ok) throw new Error(`Create failed with status ${res.status}`);
                return res.json();
            })
            .then(newVenue => {
                const updatedList = [...venues, newVenue];
                setVenues(updatedList);
                setFiltered(updatedList);
                setFormData({ name: '', location: '', type: '' });
            })
            .catch(err => console.error('Create failed:', err));
    };

    const handleDelete = (venueId) => {
        const token = localStorage.getItem('token');

        fetch(`/api/venue/delete/${venueId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
                setVenues(venues.filter(v => v.id !== venueId));
                setFiltered(filtered.filter(v => v.id !== venueId));
            })
            .catch(err => console.error('Delete failed:', err));
    };

    return (
        <div className="container">
            <div className="headerRow">
                <h2 className="header">Майданчики</h2>
                <button className="adminLoginButton" onClick={() => setShowLoginForm(prev => !prev)}>
                    {isAdmin ? 'Вийти' : 'Увійти як адмін'}
                </button>
            </div>

            {showLoginForm && !isAdmin && (
                <form className="form" onSubmit={handleLogin}>
                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        value={loginData.email || ''}
                        onChange={handleLoginChange}
                        required
                        className="input"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={loginData.password || ''}
                        onChange={handleLoginChange}
                        required
                        className="input"
                    />
                    <button type="submit" className="saveButton">Увійти</button>
                </form>
            )}


            <div className="dropdownWrapper">
                <button className="dropdownButton" onClick={() => setShowMenu(prev => !prev)}>
                    {typeFilter ? `Фільтр: ${typeFilter}` : 'Фільтр за типом'} ⌄
                </button>

                {showMenu && (
                    <ul className="dropdownMenu">
                        {uniqueTypes.map(type => (
                            <li key={type} onClick={() => handleTypeSelect(type)}>
                                {type}
                            </li>
                        ))}
                        <li onClick={() => handleTypeSelect('')}>Очистити фільтр</li>
                    </ul>
                )}
            </div>

            <ul className="venueList">
                {filtered.map(venue => (
                    <li key={venue.id} className="venueItem">
                        <div className="venueInfo">
                            <div className="venueName">{venue.name}</div>
                            <div className="venueDetails">{venue.location} — <em>{venue.type}</em></div>
                        </div>
                        {isAdmin && (
                            <div className="adminControls">
                                <button className="deleteButton" onClick={() => handleDelete(venue.id)}>Видалити</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {isAdmin && (
                <form className="form" onSubmit={editingVenue ? handleSubmit : (e) => { e.preventDefault(); handleAdd(); }}>
                    <h3 className="formHeader">{editingVenue ? 'Редагувати майданчик' : 'Додати новий майданчик'}</h3>
                    <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Назва" className="input" required />
                    <input name="location" value={formData.location || ''} onChange={handleChange} placeholder="Локація" className="input" required />
                    <input name="type" value={formData.type || ''} onChange={handleChange} placeholder="Тип" className="input" required />
                    <div className="buttonGroup">
                        <button type="submit" className="saveButton">{editingVenue ? 'Зберегти' : 'Додати'}</button>
                        {editingVenue && (
                            <button type="button" className="cancelButton" onClick={() => setEditingVenue(null)}>Скасувати</button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
};

export default VenueList;
