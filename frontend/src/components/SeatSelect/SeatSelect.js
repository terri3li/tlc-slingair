import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import Plane from "./Plane";
import Form from "./Form";

const SeatSelect = ({ selectedFlight, setReservationId, reservationId }) => {
  const [selectedSeat, setSelectedSeat] = useState("");
  const [ id, setId ] = useState()
  const navigate = useNavigate();

  const handleSubmit = (e, formData) => {
    e.preventDefault();
    fetch("/api/add-reservation", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flight: selectedFlight,
        seat: selectedSeat,
        givenName: formData.firstName,
        surname: formData.lastName,
        email: formData.email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        window.localStorage.setItem("ReservationId", JSON.stringify(data))
          navigate(`/confirmation`);
        }
      )
      .catch((error) => {
        console.log(error);
      });
  };

    useEffect(() => {
        fetch('/api/get-reservations')
        .then((res) => res.json())
        .then((data) => {
            setReservationId(data.data[data.data.length-1]._id)
        })
        }, [])

     

  return (
    <Wrapper>
      <h2>Select your seat and Provide your information!</h2>
      <>
        <FormWrapper>
          <Plane
            setSelectedSeat={setSelectedSeat}
            selectedSeat={selectedSeat}
            selectedFlight={selectedFlight}
          />
          <Form handleSubmit={handleSubmit} selectedSeat={selectedSeat} />
        </FormWrapper>
      </>
    </Wrapper>
  );
};

const FormWrapper = styled.div`
  display: flex;
  margin: 50px 0px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
`;

export default SeatSelect;
