// Database wrapper utilities for NoteSponge
// Adapted from tauri-plugin-sql wrapper.rs

use indexmap::IndexMap;
use serde_json::Value as JsonValue;
use sqlx::{Column, Executor, Row, TypeInfo};
use tauri_plugin_sql::DbPool;

/// A strongly-typed SQL value
#[derive(Debug, Clone)]
pub enum SqlValue {
    Integer(i64),
    #[allow(unused)]
    Real(f64),
    Text(String),
    Blob(String),
    Null,
}

impl SqlValue {
    /// Get the value as an i64 if it's an Integer
    pub fn as_i64(&self) -> Option<i64> {
        match self {
            SqlValue::Integer(i) => Some(*i),
            _ => None,
        }
    }
    
    /// Get the value as a string reference if it's Text or Blob
    pub fn as_str(&self) -> Option<&str> {
        match self {
            SqlValue::Text(s) | SqlValue::Blob(s) => Some(s),
            _ => None,
        }
    }
}

// Extension methods for DbPool
pub trait DbPoolExt {
    /// Execute a SQL query with parameters and return the number of affected rows
    #[allow(unused)]
    async fn execute_query(&self, query: &str, values: Vec<JsonValue>) -> Result<u64, sqlx::Error>;
    
    /// Execute a SQL query with parameters and return the results as a vector of maps
    async fn select_query(&self, query: &str, values: Vec<JsonValue>) -> Result<Vec<IndexMap<String, SqlValue>>, sqlx::Error>;
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
    
    async fn select_query(&self, query: &str, values: Vec<JsonValue>) -> Result<Vec<IndexMap<String, SqlValue>>, sqlx::Error> {
        let DbPool::Sqlite(pool) = self;
        
        let mut query_builder = sqlx::query(query);
        for value in values.iter() {
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
        
        let rows = pool.fetch_all(query_builder).await?;
        let mut values = Vec::new();
        
        for row in rows.iter() {
            let mut value = IndexMap::default();
            for (i, column) in row.columns().iter().enumerate() {
                let column_type = column.type_info().name();
                
                let sql_value = match column_type {
                    "INTEGER" => {
                        let v = row.try_get::<i64, _>(i)?;
                        SqlValue::Integer(v)
                    },
                    "REAL" => {
                        let v = row.try_get::<f64, _>(i)?;
                        SqlValue::Real(v)
                    },
                    "TEXT" => {
                        let v = row.try_get::<String, _>(i)?;
                        SqlValue::Text(v)
                    },
                    "BLOB" => {
                        // For BLOB data, just pass through the string value without encoding
                        // This assumes the BLOB is already stored as base64 in the database
                        let v = row.try_get::<String, _>(i)?;
                        SqlValue::Blob(v)
                    },
                    _ => SqlValue::Null,
                };
                
                value.insert(column.name().to_string(), sql_value);
            }
            values.push(value);
        }
        
        Ok(values)
    }
}