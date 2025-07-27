const listOfGoods = require("./Goods/goods.json");

const fs = require("fs");
const http = require("http");
const url = require("url");

const PORT = 8000;

const server = http.createServer((req, res) => {
  const { url, method } = req;
  const uuid = require("uuid").v4();
  if (url.startsWith("/create-goods") && method === "POST") {
    let body = "";
    console.log(body);

    req.on("data", (chunks) => {
      body += chunks;
    });
    req.on("end", () => {
      const data = JSON.parse(body);
      const goods = {
        id: uuid,
        name: data.name,
        inStock: data.inStock,
        unit: data.unit,
        unitPrice: data.unitPrice,
      };
      console.log(goods);

      const totalPrice = data.unitPrice * data.unit;
      const goodsWithTotalPrice = {
        ...goods,
        totalPrice,
      };
      console.log(goodsWithTotalPrice);

      listOfGoods.push(goodsWithTotalPrice);
      fs.writeFile("./Goods/Goods.json", JSON.stringify(listOfGoods, null, 2), (error, data) => {
        if (error) {
          res.writeHead(400, { "content-type": "text/plain" });
          res.end("Bad Request");
        } else {
          res.writeHead(201, { "content-type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Goods created successfully",
              goods: goodsWithTotalPrice,
            })
          );
        }
      });
    });
  } else if (url.startsWith("/list-of-goods") && method === "GET") {
    if (listOfGoods.length < 1) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("No goods found");
    } else {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "List of Goods",
          total: listOfGoods.length,
          data: listOfGoods,
        })
      );
    }
  } else if (url.startsWith("/goods/") && method === "GET") {
    const id = url.split("/")[2];
    const goods = listOfGoods.find((n) => n.id === id);
    if (!goods) {
      res.writeHead(400, { "content-type": "text/plain" });
      res.end("Goods not found");
    } else {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Goods found",
          data: goodsWithTotalPrice,
        })
      );
    }
  } else if (url.startsWith("/update-goods/") && method === "PUT") {
    const id = url.split("/")[2];
    let body = "";
    req.on("data", (chunks) => {
      body += chunks;
    });
    req.on("end", () => {
      const update = JSON.parse(body);
      const goods = listOfGoods.find((n) => n.id === id);
      Object.assign(goods, update);
      const goodsIndexOf = listOfGoods.findIndex((n) => n.id === id);
      if (goodsIndexOf !== -1) {
        const totalPrice = goods.unitPrice * goods.unit;
        const goodsWithTotalPrice = {
          ...goods,
          totalPrice,
        };
        listOfGoods[goodsIndexOf] = goodsWithTotalPrice;
        fs.writeFile("./Goods/Goods.json", JSON.stringify(listOfGoods, null, 2), (error, data) => {
          if (error) {
            res.writeHead(400, { "content-type": "text/plain" });
            res.end("Bad Request");
          } else {
            res.writeHead(200, { "content-type": "application/json" });
            res.end(
              JSON.stringify({
                message: "Goods updated successfully",
                data: goodsWithTotalPrice,
              })
            );
          }
        });
      }
    });
  } else if (url.startsWith("/delete-goods/") && method === "DELETE") {
    const id = url.split("/")[2];
    const goodsIndex = listOfGoods.findIndex((n) => n.id === id);
    if (goodsIndex !== -1) {
      listOfGoods.splice(goodsIndex, 1);
      fs.writeFile("./Goods/Goods.json", JSON.stringify(listOfGoods, null, 2), (error, data) => {
        if (error) {
          res.writeHead(400, { "content-type": "text/plain" });
          res.end("Bad Request");
        } else {
          res.writeHead(200, { "content-type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Goods deleted successfully",
            })
          );
        }
      });
    } else {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("Goods not found");
    }
  }
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
