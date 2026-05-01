import setupTestDB from "./test-db";
import setupTestRedis from "./test-redis";

module.exports = async () => {
  await setupTestDB();
  await setupTestRedis();
};
