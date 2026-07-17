export default {
  buildCommand:
    process.env.OPEN_NEXT_SKIP_NEXT_BUILD === "1"
      ? "true"
      : "npm run build",
};
