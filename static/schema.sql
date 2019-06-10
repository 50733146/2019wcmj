drop table if exists cms;
create table cms(
	id integer primary key autoincrement,
	follow integer,
	title text,
	content text,
	memo text,
);
