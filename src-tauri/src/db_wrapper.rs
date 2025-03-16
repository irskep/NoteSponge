// Database wrapper utilities for NoteSponge
// Adapted from tauri-plugin-sql wrapper.rs

use indexmap::IndexMap;
use serde_json::Value as JsonValue;
use sqlx::{Column, Executor, Row, TypeInfo};
use tauri_plugin_sql::DbPool;
use base64::{engine::general_purpose::STANDARD, Engine};

// Extension methods for DbPool
pub trait DbPoolExt {
    /// Execute a SQL query with parameters and return the number of affected rows
    #[allow(unused)]
    async fn execute_query(&self, query: &str, values: Vec<JsonValue>) -> Result<u64, sqlx::Error>;
    
    /// Execute a SQL query with parameters and return the results as a vector of maps
    async fn select_query(&self, query: &str, values: Vec<JsonValue>) -> Result<Vec<IndexMap<String, JsonValue>>, sqlx::Error>;
}

impl DbPoolExt for DbPool {
    #[allow(unused)]
    async fn execute_query(&self, query: &str, values: Vec<JsonValue>) -> Result<u64, sqlx::Error> {
        let DbPool::Sqlite(pool) = self;
        
        let mut query_builder = sqlx::query(query);
        for value in values {
            if value.is_null() {
                query_builder = query_builder.bind(None::<JsonValue>);
            } else if value.is_string() {
                query_builder = query_builder.bind(value.as_str().unwrap().to_owned())
            } else if let Some(number) = value.as_number() {
                query_builder = query_builder.bind(number.as_f64().unwrap_or_default())
            } else {
                query_builder = query_builder.bind(value);
            }
        }
        let result = pool.execute(query_builder).await?;
        Ok(result.rows_affected())
    }
    
    async fn select_query(&self, query: &str, values: Vec<JsonValue>) -> Result<Vec<IndexMap<String, JsonValue>>, sqlx::Error> {
        println!("DbPoolExt::select_query called with query: {}", query);
        
        let DbPool::Sqlite(pool) = self;
        
        println!("Building query with {} parameters", values.len());
        
        let mut query_builder = sqlx::query(query);
        for (i, value) in values.iter().enumerate() {
            println!("Binding parameter {}: {:?}", i, value);
            if value.is_null() {
                query_builder = query_builder.bind(None::<JsonValue>);
            } else if value.is_string() {
                query_builder = query_builder.bind(value.as_str().unwrap().to_owned())
            } else if let Some(number) = value.as_number() {
                query_builder = query_builder.bind(number.as_f64().unwrap_or_default())
            } else {
                query_builder = query_builder.bind(value.clone());
            }
        }
        
        println!("Executing query");
        let rows = match pool.fetch_all(query_builder).await {
            Ok(r) => {
                println!("Query returned {} rows", r.len());
                r
            },
            Err(e) => {
                println!("Query failed: {}", e);
                return Err(e);
            }
        };
        
        println!("Processing rows");
        let mut values = Vec::new();
        for (row_idx, row) in rows.iter().enumerate() {
            println!("Processing row {}", row_idx);
            let mut value = IndexMap::default();
            for (i, column) in row.columns().iter().enumerate() {
                println!("Processing column {}: {}", i, column.name());
                
                // Handle different column types
                let column_type = column.type_info().name();
                println!("Column type: {}", column_type);
                
                let json_value = match column_type {
                    "INTEGER" => {
                        match row.try_get::<i64, _>(i) {
                            Ok(v) => JsonValue::Number(v.into()),
                            Err(e) => {
                                println!("Failed to get INTEGER value for column {}: {}", column.name(), e);
                                return Err(e);
                            }
                        }
                    },
                    "REAL" => {
                        match row.try_get::<f64, _>(i) {
                            Ok(v) => {
                                match serde_json::Number::from_f64(v) {
                                    Some(n) => JsonValue::Number(n),
                                    None => {
                                        println!("Failed to convert f64 to JSON Number: {}", v);
                                        JsonValue::Null
                                    }
                                }
                            },
                            Err(e) => {
                                println!("Failed to get REAL value for column {}: {}", column.name(), e);
                                return Err(e);
                            }
                        }
                    },
                    "TEXT" => {
                        match row.try_get::<String, _>(i) {
                            Ok(v) => JsonValue::String(v),
                            Err(e) => {
                                println!("Failed to get TEXT value for column {}: {}", column.name(), e);
                                return Err(e);
                            }
                        }
                    },
                    "BLOB" => {
                        match row.try_get::<Vec<u8>, _>(i) {
                            Ok(v) => {
                                // Convert binary data to base64 string
                                let base64 = STANDARD.encode(&v);
                                JsonValue::String(base64)
                            },
                            Err(e) => {
                                println!("Failed to get BLOB value for column {}: {}", column.name(), e);
                                return Err(e);
                            }
                        }
                    },
                    "NULL" => JsonValue::Null,
                    _ => {
                        println!("Unknown column type: {}", column_type);
                        JsonValue::Null
                    }
                };
                
                value.insert(column.name().to_string(), json_value);
            }
            values.push(value);
        }
        
        println!("Returning {} rows", values.len());
        Ok(values)
    }
}