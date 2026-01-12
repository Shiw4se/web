import React, { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import styles from './VenueList.module.css';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';


const VenueList = ({ setView, isUserLoggedIn, setIsUserLoggedIn }) => {
    const [venues, setVenues] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [typeFilter, setTypeFilter] = useState('');
    const [showMenu, setShowMenu] = useState(false);



    const [showAuthForm, setShowAuthForm] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

    const [isAdmin, setIsAdmin] = useState(false);
    const [editingVenue, setEditingVenue] = useState(null);
    const [formData, setFormData] = useState({ name: '', location: '', type: '' });

    const [bookingVenue, setBookingVenue] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);



    useEffect(() => {

        const token = localStorage.getItem('token');
        if (token && isUserLoggedIn) {
            try {
                const decoded = jwtDecode(token);
            } catch(e) {}
        }

        fetch('/api/venue/get_all')
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(data => {
                setVenues(data);
                setFiltered(data);
            })
            .catch(err => console.error('Error fetching venues:', err));
    }, [isUserLoggedIn]);

    useEffect(() => {
        if (isUserLoggedIn && bookingVenue) {
            fetchSlots(bookingVenue.id);
        }
    }, [isUserLoggedIn, bookingVenue]);

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
        setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = (e) => {
        e.preventDefault();
        fetch('/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        })
            .then(res => res.ok ? res.json() : Promise.reject('Помилка входу'))
            .then(data => {
                const token = data.token;
                localStorage.setItem('token', token);

                return fetch('/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
            })
            .then(res => res.json())
            .then(user => {
                if (user.role !== 'user') setIsAdmin(true);
                else setIsAdmin(false);


                setIsUserLoggedIn(true);

                setShowAuthForm(false);
            })
            .catch(err => alert(err));
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirmPassword) {
            alert("Паролі не співпадають!");
            return;
        }
        fetch('api/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: registerData.name,
                email: registerData.email,
                password: registerData.password,
            }),
        }).then(res => {
            if (!res.ok) throw new Error(`Register failed: ${res.status}`);
            return res.json();
        }).then(() => {
            alert("Реєстрація успішна! Можна увійти.");
            setIsLoginMode(true);
            setShowAuthForm(true);
            setRegisterData({ name: "", email: "", password: "", confirmPassword: "" });
        }).catch(err => alert(err));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsUserLoggedIn(false);
        setIsAdmin(false);
        setBookingVenue(null);
        setSlots([]);
        setSelectedSlot(null);
    };

    const fetchSlots = (venueId) => {
        const token = localStorage.getItem('token');
        fetch(`/api/venue/find_by_id/${venueId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : Promise.reject('Error'))
            .then(data => setSlots(data))
            .catch(err => console.log(err));
    };

    const handleBookingClick = (venue) => {
        if (!isUserLoggedIn) {
            alert('Будь ласка, увійдіть в акаунт');
            setShowAuthForm(true);
            setIsLoginMode(true);
            setBookingVenue(venue);
            return;
        }
        setBookingVenue(venue);
        fetchSlots(venue.id);
    };

    const handleConfirmBooking = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const dec = jwtDecode(token);
            const Userid = dec.id;

            fetch(`/api/bookings/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: Userid,
                    venue_id: bookingVenue.id,
                    slot_id: selectedSlot.id,
                    start_time: selectedSlot.start_time,
                    end_time: selectedSlot.end_time,
                    status: 'booked',
                }),
            })
                .then(async res => {
                    if (!res.ok) throw new Error(await res.text());
                    return res.json();
                })
                .then(() => {
                    alert('Бронювання успішне!');
                    setBookingVenue(null);
                    setSlots([]);
                    setSelectedSlot(null);
                })
                .catch(err => alert(`Помилка: ${err.message}`));
        } catch (error) {
            console.error(error);
        }
    };


    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleEditClick = (venue) => {
        setEditingVenue(venue);
        setFormData({ name: venue.name, location: venue.location, type: venue.type });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        fetch(`/api/venue/update/${editingVenue.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData),
        }).then(res => res.json()).then(updated => {
            const updatedList = venues.map(v => (v.id === updated.id ? updated : v));
            setVenues(updatedList); setFiltered(updatedList); setEditingVenue(null);
        });
    };
    const handleAdd = () => {
        const token = localStorage.getItem('token');
        fetch('/api/venue/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData),
        }).then(res => res.json()).then(newVenue => {
            setVenues([...venues, newVenue]); setFiltered([...filtered, newVenue]); setFormData({ name: '', location: '', type: '' });
        });
    };
    const handleDelete = (venueId) => {
        const token = localStorage.getItem('token');
        fetch(`/api/venue/delete/${venueId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                setVenues(venues.filter(v => v.id !== venueId));
                setFiltered(filtered.filter(v => v.id !== venueId));
            });
    };

    return (
        <div className={styles.container}>
            <div className={styles.authHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                {isUserLoggedIn ? (
                    <button onClick={handleLogout}>Вийти</button>
                ) : (
                    <>
                        <button onClick={() => { setShowAuthForm(prev => !prev); setIsLoginMode(true); }}>
                            {showAuthForm ? 'Скасувати' : 'Увійти'}
                        </button>
                        <button onClick={() => { setShowAuthForm(true); setIsLoginMode(false); }} className={styles.registerButton}>
                            Зареєструватись
                        </button>
                    </>
                )}
            </div>

            {/* ФОРМЫ ВХОДА И РЕГИСТРАЦИИ */}
            {showAuthForm && !isUserLoggedIn && (
                isLoginMode ? (
                    <form className={styles.form} onSubmit={handleLogin}>
                        <input name="email" type="email" placeholder="Email" value={loginData.email} onChange={handleLoginChange} required className={styles.input} />
                        <input name="password" type="password" placeholder="Пароль" value={loginData.password} onChange={handleLoginChange} required className={styles.input} />
                        <button type="submit" className={styles.saveButton}>Увійти</button>
                    </form>
                ) : (
                    <form className={styles.input} onSubmit={handleRegister}>
                        <input name="name" placeholder="Name" value={registerData.name} onChange={handleRegisterChange} required className={styles.input} />
                        <input name="email" type="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} required className={styles.input} />
                        <input name="password" type="password" placeholder="Пароль" value={registerData.password} onChange={handleRegisterChange} required className={styles.input} />
                        <input name="confirmPassword" type="password" placeholder="Підтвердження" value={registerData.confirmPassword} onChange={handleRegisterChange} required className={styles.input} />
                        <button type="submit" className={styles.saveButton}>Зареєструватися</button>
                    </form>
                )
            )}

            {/* ОСНОВНОЙ СПИСОК (Убрал проверку showProfile) */}
            <div className={styles.headerRow}>
                <h2 className={styles.header}>Майданчики</h2>
            </div>

            <div className={styles.dropdownWrapper}>
                <button className={styles.dropdownButton} onClick={() => setShowMenu(prev => !prev)}>
                    {typeFilter ? `Фільтр: ${typeFilter}` : 'Фільтр за типом'} ⌄
                </button>
                {showMenu && (
                    <ul className={styles.dropdownMenu}>
                        {uniqueTypes.map(type => (
                            <li key={type} onClick={() => handleTypeSelect(type)}>{type}</li>
                        ))}
                        <li onClick={() => handleTypeSelect('')}>Очистити фільтр</li>
                    </ul>
                )}
            </div>

            <ul className={styles.venueList}>
                {filtered.map(venue => (
                    <li key={venue.id} className={styles.venueItem}>
                        <div>
                            <h3>{venue.name}</h3>
                            <p>{venue.location}</p>
                            <p><i>{venue.type}</i></p>
                        </div>
                        <div>
                            {!isAdmin && (
                                <button onClick={() => handleBookingClick(venue)} className={styles.bookButton}>
                                    Забронювати
                                </button>
                            )}
                            {isAdmin && (
                                <>
                                    <button onClick={() => handleEditClick(venue)} className={styles.editButton}>Редагувати</button>
                                    <button onClick={() => handleDelete(venue.id)} className={styles.deleteButton}>Видалити</button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {/* АДМИН ПАНЕЛЬ И БРОНИРОВАНИЕ */}
            {isAdmin && editingVenue && (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input name="name" value={formData.name} onChange={handleChange} className={styles.input} />
                    <input name="location" value={formData.location} onChange={handleChange} className={styles.input} />
                    <input name="type" value={formData.type} onChange={handleChange} className={styles.input} />
                    <button type="submit" className={styles.saveButton}>Зберегти</button>
                    <button onClick={() => setEditingVenue(null)} className={styles.cancelButton} type="button">Скасувати</button>
                </form>
            )}

            {isAdmin && !editingVenue && (
                <div className={styles.addVenueForm}>
                    <h3>Додати новий майданчик</h3>
                    <input name="name" placeholder="Назва" value={formData.name} onChange={handleChange} className={styles.input} />
                    <input name="location" placeholder="Адреса" value={formData.location} onChange={handleChange} className={styles.input} />
                    <input name="type" placeholder="Тип" value={formData.type} onChange={handleChange} className={styles.input} />
                    <button onClick={handleAdd} className={styles.addButton}>Додати</button>
                </div>
            )}

            {bookingVenue && (
                <div className={styles.bookingSection}>
                    <h3>Обрати слот для: {bookingVenue.name}</h3>
                    <ul>
                        {slots.filter(slot => slot.is_available).map(slot => (
                            <li key={slot.id}>
                                <label className={styles.slotLabel}>
                                    <input type="radio" name="slot" value={slot.id} onChange={() => setSelectedSlot(slot)} />
                                    <span>{format(new Date(slot.start_time), 'd MMMM, HH:mm', { locale: uk })} — {format(new Date(slot.end_time), 'HH:mm', { locale: uk })}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleConfirmBooking} disabled={!selectedSlot} className={styles.confirmButton}>Підтвердити</button>
                    <button onClick={() => { setBookingVenue(null); setSlots([]); }} className={styles.cancelButton}>Скасувати</button>
                </div>
            )}
        </div>
    );
};

export default VenueList;