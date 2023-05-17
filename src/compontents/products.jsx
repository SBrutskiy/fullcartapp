import React from "react";
import ReactBootstrap from "react-bootstrap";
import axios from "axios";
import {
  Card,
  Accordion,
  Button,
  Container,
  Row,
  Col,
  Image,
} from "react-bootstrap";
// simulate getting products from DataBase
const products = [
  { id: "1", name: "Apples", country: "Italy", cost: 3, instock: 10 },
  { id: "2", name: "Oranges", country: "Spain", cost: 4, instock: 3 },
  { id: "3", name: "Beans", country: "USA", cost: 2, instock: 5 },
  { id: "5", name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [fetchCount, setFetchCount] = useState(0);
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  function doFetch() {
    setFetchCount(fetchCount + 1);
  }
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(initialUrl);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({
            type: "FETCH_SUCCESS",
            payload: transformPayload(result.data, fetchCount),
          });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    if (fetchCount) {
      fetchData();
    }
    return () => {
      didCancel = true;
    };
  }, [fetchCount]);
  return [state, doFetch];
};
function transformPayload(payload, fetchCount) {
  return payload.data.map((item) => ({
    id: `${fetchCount}_${item.id}`,
    ...item.attributes,
  }));
}
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};
function Cart(props) {
  return (
    <div>
      {props.cart.map((item, index) => (
        <div key={index} index={index}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);

  //  Fetch Data

  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    []
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  React.useEffect(() => {
    setItems([...items, ...data]);
  }, [data]);
  // Fetch Data
  const addToCart = (e) => {
    const id = e.target.id;
    const itemIndex = items.findIndex((item) => item.id === id);

    // const newSelectedUser = { ...allUsers[selectedUserIndex] };
    const item = { ...items[itemIndex] };
    if (item) {
      setCart([...cart, item]);
      item.instock = item.instock - 1;
      setItems([
        ...items.slice(0, itemIndex),
        item,
        ...items.slice(itemIndex + 1),
      ]);
    }
  };
  const deleteCartItem = (index) => {
    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
  };
  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  const list = items.map((item, index) => {
    //let n = index + 1049;
    //let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <Image src={photos[index % 4]} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name} stock:{item.instock} price:{item.cost}
        </Button>
        <input id={item.id} type="submit" onClick={addToCart}></input>
      </li>
    );
  });
  const CartList = cart.map((item, index) => {
    return (
      <Accordion.Item key={1 + index} eventKey={1 + index}>
        <Accordion.Header>{item.name}</Accordion.Header>
        <Accordion.Body
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          $ {item.cost} from {item.country}
        </Accordion.Body>
      </Accordion.Item>
    );
  });

  const getTotal = () => {
    const reducer = (accum, item) => accum + item.cost;
    const newTotal = cart.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  const total = getTotal();

  const restockProducts = (event) => {
    doFetch();
    event.preventDefault();
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion defaultActiveKey="0">{CartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button>CheckOut $ {total}</Button>
          <Cart cart={cart} />
        </Col>
      </Row>
      <Row>
        <form onSubmit={restockProducts}>
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
export default Products;
