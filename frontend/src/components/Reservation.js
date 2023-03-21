import { useState } from "react";
import styled from "styled-components";
import tombstone from "../assets/tombstone.png";
import { useEffect } from "react";


const Reservation = () => {

    const [confirmRes, setConfirmRes] = useState(); 
    const [ status, setStatus ] = useState("loading")
    
    const storedId = JSON.parse(window.localStorage.getItem("ReservationId"));

    useEffect(() => {
    fetch(`/api/get-reservation/${storedId}`)
    .then((res) => res.json())
    .then((data) => {
     setConfirmRes(data.data)
     setStatus("idle")
    })
    }, [])

    return (
        <>
    {status === "loading" ? (<h2>Loading...</h2>) : (
        <>
        <Wrapper>Reservation page</Wrapper>
        <h2>{confirmRes.flight}</h2>
        <h2>{confirmRes._id}</h2>
        <h2>{confirmRes.givenName}</h2>
        <h2>{confirmRes.surname}</h2>
        <h2>{confirmRes.email}</h2>
        </>
        )}
</>
    )
};

const Wrapper = styled.div``;

export default Reservation;
