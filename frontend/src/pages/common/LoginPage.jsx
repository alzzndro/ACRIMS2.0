import '../../assets/css/common/loginPage.css';
import '../../assets/css/common/variables.css';
import NavBarBurger from '../../components/common/NavBarBurger';
import LogoAc from '../../assets/images/logoac.png';
import Logo from '../../assets/images/logo.png';
import RedBox from '../../components/designs/RedBox';
import BlueBox from '../../components/designs/BlueBox';
import BlueSingleBox from '../../components/designs/BlueSingleBox';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const LoginPage = () => {
    const navigate = useNavigate();

    const invalidNotify = () => {
        toast.error('Invalid Credentials', {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
        });
    };

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`, {
                email: formData.email,
                password: formData.password,
            });

            const { success, message, token, user } = data;
            if (!success) return invalidNotify();

            console.log(message);

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (formData.remember) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('savedEmail', formData.email);
                localStorage.setItem('savedPassword', formData.password);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('savedEmail');
                localStorage.removeItem('savedPassword');
            }

            if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'checker') navigate('/home');
            else if (user.role === 'instructor') navigate('/instructor/home');
            else if (user.role === 'dpd') navigate('/dpd/home');
            else if (user.role === 'rlic') navigate('/rlic/home');
            else invalidNotify();
        } catch (error) {
            console.error(error);
            invalidNotify();
        }
    };

    useEffect(() => {
        const remember = localStorage.getItem('rememberMe');
        if (remember === 'true') {
            setFormData((prev) => ({
                ...prev,
                email: localStorage.getItem('savedEmail') || '',
                password: localStorage.getItem('savedPassword') || '',
                remember: true,
            }));
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const parsedUser = user ? JSON.parse(user) : null;
        const remember = localStorage.getItem('rememberMe');

        if (token && parsedUser && remember === 'true') {
            if (parsedUser.role === 'admin') navigate('/admin/dashboard');
            else if (parsedUser.role === 'checker') navigate('/home');
            else if (parsedUser.role === 'instructor') navigate('/instructor/home');
            else if (parsedUser.role === 'dpd') navigate('/dpd/home');
            else if (parsedUser.role === 'rlic') navigate('/rlic/home');
        }
    }, [navigate]);

    return (
        <>
            <div className="relative overflow-hidden">
                <NavBarBurger />
                <div className="w-full h-[calc(100svh-3.75rem)] @container/Login">
                    <div className="flex justify-center md:px-20 md:justify-start lg:absolute lg:bottom-1/2 lg:right-1/2">
                        <img src={LogoAc} className="h-28 md:h-38 lg:h-42" alt="" />
                    </div>

                    <div className="h-[calc(100svh-12rem)] px-5 flex justify-center items-center lg:justify-end lg:items-center lg:px-30">
                        <form onSubmit={handleSubmit} className="z-10 rounded-2xl shadow-md">
                            <fieldset className="flex items-center flex-col pb-5 pt-5 px-5 rounded-2xl bg-white h-fit md:p-10 md:w-3/5 lg:w-[25rem] shadow-2xl @[414px]/Login:w-80">
                                <img src={Logo} className="h-24 md:h-30" alt="" />

                                <div className="mt-5 w-full flex flex-col gap-4 md:gap-4">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        required
                                        placeholder="Email"
                                        className="input bg-gray-100 px-4 w-full h-12"
                                        value={formData.email}
                                        autoComplete="email"
                                        onChange={handleChange}
                                    />

                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        required
                                        placeholder="Password"
                                        className="input bg-gray-100 px-4 w-full h-12 rounded-4xl"
                                        value={formData.password}
                                        autoComplete="current-password"
                                        onChange={handleChange}
                                    />

                                    <div className="flex flex-row gap-2">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            name="remember"
                                            checked={formData.remember}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="remember">Remember Me</label>
                                    </div>
                                </div>

                                <input
                                    type="submit"
                                    name="submit"
                                    id="submit"
                                    value="LOGIN"
                                    className="bg-[var(--blue-logo)] z-10 text-white mt-5 md:mt-8 w-full h-12 font-bold rounded-lg lg:hover:scale-110 cursor-pointer"
                                />
                            </fieldset>
                        </form>
                    </div>
                </div>

                <div className="redbox block md:hidden absolute top-0 left-[-8rem] rotate-45">
                    <RedBox className={'h-40'} />
                </div>
                <div className="bluebox block md:hidden absolute top-0 right-[-8rem] rotate-45">
                    <BlueBox className={'h-40'} />
                </div>
                <div className="hidden md:block absolute md:bottom-[-5rem] md:left-[-18rem] lg:bottom-[-30rem] lg:left-[-30rem] rotate-45">
                    <BlueSingleBox className={'h-[35rem] lg:h-[54rem]'} />
                </div>
                <div className="hidden md:block absolute md:top-[10rem] md:right-[-18rem] lg:top-[4rem] lg:right-[-20rem] rotate-45">
                    <BlueSingleBox className={'h-[35rem] lg:h-[54rem] lg:shadow-lg'} />
                </div>
            </div>

            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
};

export default LoginPage;
