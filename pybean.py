#coding: utf-8
import sqlite3
from pkg_resources import parse_version

__version__ = "0.2.1"
__author__ = "Mickael Desfrenes"
__email__ = "desfrenes@gmail.com"

# Yen 2013.04.08, 將 Python2 的 .next() 改為 next(), 以便在 Python 3 中使用

class SQLiteWriter(object):

    """
    In frozen mode (the default), the writer will not alter db schema.
    Just add frozen=False to enable column creation (or just add False
    as second parameter):

    query_writer = SQLiteWriter(":memory:", False)
    """
    def __init__(self, db_path=":memory:", frozen=True):
        self.db = sqlite3.connect(db_path)
        self.db.isolation_level = None
        self.db.row_factory = sqlite3.Row
        self.frozen = frozen
        self.cursor = self.db.cursor()
        self.cursor.execute("PRAGMA foreign_keys=ON;")
        self.cursor.execute('PRAGMA encoding = "UTF-8";')
        self.cursor.execute('BEGIN;')
    def __del__(self):
        self.db.close()

    def replace(self, bean):
        keys = []
        values = []
        write_operation = "replace"
        if "id" not in bean.__dict__:
            write_operation = "insert"
            keys.append("id")
            values.append(None)
        self.__create_table(bean.__class__.__name__)
        columns = self.__get_columns(bean.__class__.__name__)
        for key in bean.__dict__:
            keys.append(key)
            if key not in columns:
                self.__create_column(bean.__class__.__name__, key,
                        type(bean.__dict__[key]))
            values.append(bean.__dict__[key])
        sql  = write_operation + " into " + bean.__class__.__name__ + "("
        sql += ",".join(keys) + ") values (" 
        sql += ",".join(["?" for i in keys])  +  ")"
        self.cursor.execute(sql, values)
        if write_operation == "insert":
            bean.id = self.cursor.lastrowid
        return bean.id

    def __create_column(self, table, column, sqltype):
        if self.frozen:
            return
        if sqltype in [float, int, bool]:
            sqltype = "NUMERIC"
        else:
            sqltype = "TEXT"
        sql = "alter table " + table + " add " + column + " " + sqltype    
        self.cursor.execute(sql)

    def __get_columns(self, table):
        columns = []
        if self.frozen:
            return columns
        self.cursor.execute("PRAGMA table_info(" + table  + ")")
        for row in self.cursor:
            columns.append(row["name"])
        return columns

    def __create_table(self, table):
        if self.frozen:
            return
        sql = "create table if not exists " + table + "(id INTEGER PRIMARY KEY AUTOINCREMENT)"
        self.cursor.execute(sql)

    def get_rows(self, table_name, sql = "1", replace = None):
        if replace is None : replace = []
        self.__create_table(table_name)
        sql = "SELECT * FROM " + table_name + " WHERE " + sql
        try:
            self.cursor.execute(sql, replace)
            for row in self.cursor:
                yield row
        except sqlite3.OperationalError:
            return
   
    def get_count(self, table_name, sql="1", replace = None):
        if replace is None : replace = []
        self.__create_table(table_name)
        sql = "SELECT count(*) AS cnt FROM " + table_name + " WHERE " + sql
        try:
            self.cursor.execute(sql, replace)
        except sqlite3.OperationalError:
            return 0
        for row in self.cursor:
            return row["cnt"]

    def delete(self, bean):
        self.__create_table(bean.__class__.__name__)
        sql = "delete from " + bean.__class__.__name__ + " where id=?"
        self.cursor.execute(sql,[bean.id])
    
    def link(self, bean_a, bean_b):
        self.replace(bean_a)
        self.replace(bean_b)
        table_a = bean_a.__class__.__name__
        table_b = bean_b.__class__.__name__
        assoc_table = self.__create_assoc_table(table_a, table_b)
        sql = "replace into " + assoc_table + "(" + table_a + "_id," + table_b
        sql += "_id) values(?,?)"
        self.cursor.execute(sql,
                [bean_a.id, bean_b.id])
    
    def unlink(self, bean_a, bean_b):
        table_a = bean_a.__class__.__name__
        table_b = bean_b.__class__.__name__
        assoc_table = self.__create_assoc_table(table_a, table_b)
        sql = "delete from " + assoc_table + " where " + table_a
        sql += "_id=? and " + table_b + "_id=?"
        self.cursor.execute(sql,
                [bean_a.id, bean_b.id])
    
    def get_linked_rows(self, bean, table_name):
        bean_table = bean.__class__.__name__
        assoc_table = self.__create_assoc_table(bean_table, table_name)
        sql = "select t.* from " + table_name + " t inner join " + assoc_table 
        sql += " a on a." + table_name + "_id = t.id where a."
        sql += bean_table + "_id=?"
        self.cursor.execute(sql,[bean.id])
        for row in self.cursor:
            yield row

    def __create_assoc_table(self, table_a, table_b):
        assoc_table = "_".join(sorted([table_a, table_b]))
        if not self.frozen:
            sql = "create table if not exists " + assoc_table + "("
            sql+= table_a + "_id NOT NULL REFERENCES " + table_a + "(id) ON DELETE cascade,"
            sql+= table_b + "_id NOT NULL REFERENCES " + table_b + "(id) ON DELETE cascade,"
            sql+= " PRIMARY KEY (" + table_a + "_id," + table_b + "_id));"
            self.cursor.execute(sql)
            # no real support for foreign keys until sqlite3 v3.6.19
            # so here's the hack
            if cmp(parse_version(sqlite3.sqlite_version),parse_version("3.6.19")) < 0:
                sql = "create trigger if not exists fk_" + table_a + "_" + assoc_table
                sql+= " before delete on " + table_a
                sql+= " for each row begin delete from " + assoc_table + " where " + table_a + "_id = OLD.id;end;"
                self.cursor.execute(sql)
                sql = "create trigger if not exists fk_" + table_b + "_" + assoc_table
                sql+= " before delete on " + table_b
                sql+= " for each row begin delete from " + assoc_table + " where " + table_b + "_id = OLD.id;end;"
                self.cursor.execute(sql)
        return assoc_table

    def delete_all(self, table_name, sql = "1", replace = None):
        if replace is None : replace = []
        self.__create_table(table_name)
        sql = "DELETE FROM " + table_name + " WHERE " + sql
        try:
            self.cursor.execute(sql, replace)
            return True
        except sqlite3.OperationalError:
            return False

    def commit(self):
        self.db.commit()



class Store(object):
    """
    A SQL writer should be passed to the constructor:

    beans_save = Store(SQLiteWriter(":memory"), frozen=False)
    """
    def __init__(self, SQLWriter):
        self.writer = SQLWriter 
    
    def new(self, table_name):
        new_object = type(table_name,(object,),{})()
        return new_object

    def save(self, bean):
        self.writer.replace(bean)
    
    def load(self, table_name, id):
        for row in self.writer.get_rows(table_name, "id=?", [id]):
            return self.row_to_object(table_name, row)

    def count(self, table_name, sql = "1", replace=None):
        return self.writer.get_count(table_name, sql, replace if replace is not None else [])

    def find(self, table_name, sql = "1", replace=None):
        for row in self.writer.get_rows(table_name, sql, replace if replace is not None else []):
            yield self.row_to_object(table_name, row)

    def find_one(self, table_name, sql = "1", replace=None):
        try:
            return next(self.find(table_name, sql, replace))
        except StopIteration:
            return None

    def delete(self, bean):
        self.writer.delete(bean)
    
    def link(self, bean_a, bean_b):
        self.writer.link(bean_a, bean_b)
    
    def unlink(self, bean_a, bean_b):
        self.writer.unlink(bean_a, bean_b)
    
    def get_linked(self, bean, table_name):
        for row in self.writer.get_linked_rows(bean, table_name):
            yield self.row_to_object(table_name, row)

    def delete_all(self, table_name, sql = "1", replace=None):
        return self.writer.delete_all(table_name, sql, replace if replace is not None else [])

    def row_to_object(self, table_name, row):
        new_object = type(table_name,(object,),{})()
        for key in row.keys():
            new_object.__dict__[key] = row[key]
        return new_object

    def commit(self):
        self.writer.commit()
