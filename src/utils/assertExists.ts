/*
    This function checks if a variable exists and throws an error if it doesn't.
    It is useful for checking if environment variables are set at the start of a program.

    Example:
    ```js
    const myVariable = assertExists(process.env.MY_VARIABLE, 'MY_VARIABLE');
    ```

    This will throw an error if MY_VARIABLE is not set.

    @param [variable] - The variable to check.
    @param [name] - The name of the variable to use in the error message.
    @returns The variable if it exists.
 */
export const assertExists = (variable?: string, name?: string) => {
  if (!variable) {
    throw new Error(`Environment variable ${name} is not set.`);
  }

  return variable;
};
