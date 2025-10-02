import React from 'react';
import { ClipLoader } from 'react-spinners';

const Loading = () => {
    return (
        <div style={styles.container}>
            <ClipLoader color="#3498db" size={60} />
            <p style={styles.text}>Loading...</p>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        fontFamily: 'sans-serif',
    },
    text: {
        marginTop: 15,
        fontSize: 18,
        color: '#555',
    },
};

export default Loading;
