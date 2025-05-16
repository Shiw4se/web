import React, { useEffect, useState } from 'react';
import './VenueList.css';  // Імпортуємо стилі

const VenueList = () => {
    const [venues, setVenues] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [typeFilter, setTypeFilter] = useState('');

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

    const handleFilter = (e) => {
        const value = e.target.value;
        setTypeFilter(value);
        if (value === '') {
            setFiltered(venues);
        } else {
            setFiltered(venues.filter(v => v.type.toLowerCase().includes(value.toLowerCase())));
        }
    };

    const handleEditClick = (venue) => {
        setEditingVenue(venue);
        setFormData({
            name: venue.name,
            location: venue.location,
            type: venue.type,
        });
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch(`/api/venue/update/${editingVenue.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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

    return (
        <div className="container">
            <h2 className="header">Майданчики</h2>
            <input
                type="text"
                placeholder="Фільтр за типом"
                value={typeFilter}
                onChange={handleFilter}
                className="filterInput"
            />
            <ul className="venueList">
                {filtered.map(venue => (
                    <li key={venue.id} className="venueItem">
                        <div className="venueInfo">
                            <div className="venueName">{venue.name}</div>
                            <div className="venueDetails">{venue.location} — <em>{venue.type}</em></div>
                        </div>
                        <button
                            className="editButton"
                            onClick={() => handleEditClick(venue)}
                        >
                            Редагувати
                        </button>
                    </li>
                ))}
            </ul>

            {editingVenue && (
                <form className="form" onSubmit={handleSubmit}>
                    <h3 className="formHeader">Редагування майданчика</h3>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Назва"
                        className="input"
                        required
                    />
                    <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Локація"
                        className="input"
                        required
                    />
                    <input
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        placeholder="Тип"
                        className="input"
                        required
                    />
                    <div className="buttonGroup">
                        <button type="submit" className="saveButton">Зберегти</button>
                        <button type="button" className="cancelButton" onClick={() => setEditingVenue(null)}>Скасувати</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default VenueList;
