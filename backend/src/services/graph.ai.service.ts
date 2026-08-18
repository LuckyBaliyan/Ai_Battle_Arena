import {
      StateSchema,
      MessagesValue,
      START,
      END,
} from "@langchain/langgraph";

type JUDGMENT = {
      winner: "solution_1" | "solution_2",
      Solution_1_score: number,
      Solution_2_score: number,
}

type AI_BATTLE_STATE = {
      messages: typeof MessagesValue,
      solution_1: string,
      solution_2: string,
      judgment: JUDGMENT,
}

//as the state moves from start node to towards end at each node state will get updated according to that node
//exactly like the working flow of langGraph

/**
 * this is the initial state
 * we can update or modify the value of state at the time of creating graph
 * the data is being transfered b/w the nodes via state (context sharing)
*/
const state: AI_BATTLE_STATE = {
      messages: MessagesValue,
      solution_1: "",
      solution_2: "",
      judgment: {
            winner: "solution_1",
            Solution_1_score: 0,
            Solution_2_score: 0,
      },
}