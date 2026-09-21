-- Create PA360 database schemas
CREATE DATABASE IF NOT EXISTS PA360_DEV;
USE DATABASE PA360_DEV;

CREATE SCHEMA IF NOT EXISTS PA360_DEV.RAW COMMENT = 'Immutable raw ingestion layer - read only';
CREATE SCHEMA IF NOT EXISTS PA360_DEV.STAGING COMMENT = 'DPS Studio transformation/cleansing layer';
CREATE SCHEMA IF NOT EXISTS PA360_DEV.CURATED COMMENT = 'Cleansed application data - Django reads/writes here';
CREATE SCHEMA IF NOT EXISTS PA360_DEV.MARTS COMMENT = 'Analytical marts for dashboards';
