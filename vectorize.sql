insert into rag (rawtext, rag)
values(@text, to_tsvector(@text))