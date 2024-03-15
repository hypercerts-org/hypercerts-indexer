interface ABIOutput {
  name: string;
  type: string;
}

interface ABI {
  name: string;
  outputs: ABIOutput[];
}

// Function to parse schema string to ABI format
export const parseSchemaToABI = (schema: string): ABI[] => {
  // Split the schema string to get each field definition
  const fields = schema.split(",");

  // Map each field to its corresponding ABI output
  const outputs: ABIOutput[] = fields.map((field) => {
    let [type, name] = field.trim().split(" ");
    // Check if the type ends with [] to identify arrays
    const isArray = type.endsWith("[]");
    // Adjust the type for array types
    type = isArray ? type : type; // No need for modification, just for clarity
    return {
      name,
      type,
    };
  });

  // Create the ABI object
  return [
    {
      name: "ParsedSchema", // Customize this as necessary
      outputs,
    },
  ];
};
