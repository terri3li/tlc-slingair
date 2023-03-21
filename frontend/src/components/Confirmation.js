import { useEffect } from "react";
import styled from "styled-components";
import { useState } from "react";

import tombstone from "../assets/tombstone.png";

const Confirmation = () => {

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
        <Wrapper>Confirmation page</Wrapper>
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

export default Confirmation;
