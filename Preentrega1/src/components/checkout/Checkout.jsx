import React, { useContext, useState } from "react";
import CartContext from "../../context/CartContext";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { Button, Input, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const [user, setUser] = useState({
    nombre: "",
    telefono: "",
    email: "",
    repetirEmail: "",
  });
  const [emailMatch, setEmailMatch] = useState(true);
  const [formError, setFormError] = useState({});
  const { cart, getTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const updateUser = (event) => {
    setUser((user) => ({
      ...user,
      [event.target.name]: event.target.value,
    }));
  };
  const validarEmail = () => {
    if (user.email === user.repetirEmail) {
      setEmailMatch(true);
    } else {
      setEmailMatch(false);
    }
  };

  const getOrder = async () => {
    validarEmail();

    if (emailMatch) {
      const ordersCollection = collection(db, "orders");

      try {
        for (const item of cart) {
          const productRef = doc(db, "productos", item.id);
          const product = await getDoc(productRef);

          const stockActual = product.data().stock;

          if (stockActual >= item.quantity) {
            await updateDoc(productRef, {
              stock: stockActual - item.quantity,
            });
          } else {
            console.log(`No hay suficiente stock del producto ${item.nombre}`);
          }
        }

        const order = {
          buyer: user,
          items: cart,
          total: getTotal(),
        };

        const orderRef = await addDoc(ordersCollection, order);
        const orderId = orderRef.id;
        
        console.log(orderId)
        alert(`El id de tu compra es${orderId}`)
        
      } catch (error) {
        console.log(error);
        alert("Ocurrio un error por favor refresca la pagina e intentalo otra vez para solucionarlo")
      }
    }
  };
  return (
    <div>
      <form action="">
        <Input onChange={updateUser} name="nombre" placeholder="Nombre" />
        <Input onChange={updateUser} name="telefono" placeholder="Teléfono" />
        <Input onChange={updateUser} name="email" placeholder="Email" />
        <Input
          onChange={updateUser}
          name="repetirEmail"
          placeholder="Repetir email"
        />

        {!emailMatch && <Text color={"red.500"}>El email no coincide</Text>}
        <Button onClick={getOrder}>Comprar</Button>
 
      </form>
    </div>
  );
};

export default Checkout;