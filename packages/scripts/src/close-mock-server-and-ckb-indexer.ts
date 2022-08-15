import request from "request";
import find from "find-process";

const closeCKBIndexer = () => {
  find("name", "ckb-indexer", true).then((list: { pid: number }[]) => {
    console.log(list);
    process.kill(list[0].pid, "SIGINT");
  });
};

const closeMockRpcServer = () => {
  const options = {
    method: "GET",
    url: "http://localhost:8118/quit",
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
};

closeCKBIndexer();
closeMockRpcServer();
