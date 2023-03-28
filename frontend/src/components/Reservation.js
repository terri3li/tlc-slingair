import { useState } from "react";
import styled from "styled-components";
import tombstone from "../assets/tombstone.png";
import { useEffect } from "react";


const Reservation = () => {

    const [confirmRes, setConfirmRes] = useState(); 
    const [ status, setStatus ] = useState("loading")
    
    const storedId = JSON.parse(window.localStorage.getItem("ReservationId"));

    useEffect(() => {
    fetch(`/api/get-reservation/${storedId.data}`)
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
        <Wrapper>Your Reservation</Wrapper>
        <h2>{confirmRes._id}</h2>
        <h2>{confirmRes.flight}</h2>
        <h2>{confirmRes.seat}</h2>
        <h2>{confirmRes.givenName}</h2>
        <h2>{confirmRes.surname}</h2>
        <Email>{confirmRes.email}</Email>
        </>
        )}
</>
    )
};

const Wrapper = styled.h1`
padding-top: 50px;
padding-bottom: 40px;`

const Email = styled.h2`
padding-bottom: 75px;`

export default Reservation;
