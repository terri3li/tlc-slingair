import { useEffect } from "react";
import styled from "styled-components";
import { useState } from "react";

import tombstone from "../assets/tombstone.png";

const Confirmation = () => {

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
        <Wrapper>Booking Confirmation</Wrapper>
        <h2>Confirmation #: {confirmRes._id}</h2>
        <h2>Flight #: {confirmRes.flight}</h2>
        <h2>Seat #: {confirmRes.seat}</h2>
        <h2>Name: {confirmRes.givenName + " " + confirmRes.surname}</h2>
        <Email>Email: {confirmRes.email}</Email>
        </>
        )}
</>
    )
};

const Wrapper = styled.h1`
padding-top: 50px;
padding-bottom: 40px;
`;

const Email = styled.h2`
padding-bottom: 75px;`

export default Confirmation;
