import React from 'react'
import { invokeBattle } from '../services/Battle.service'

const useInvoke = () => {

      const invoke = async (input) => {
            const result = await invokeBattle(input);
            return result;
      }

      return (
            invoke
      )
}

export default useInvoke;