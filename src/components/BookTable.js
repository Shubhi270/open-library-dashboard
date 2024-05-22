import React, { useEffect, useState } from "react";
import { fetchBooks, fetchAuthorDetails } from "../api/openLibraryApi";
import "./BookTable.css";

const BookTable = () => {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Defaulting to 10 rows per page
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("title");
  const [totalBooks, setTotalBooks] = useState(0);
  const [authorSearch, setAuthorSearch] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [editedBook, setEditedBook] = useState({});

  useEffect(() => {
    const loadBooks = async () => {
      const booksData = await fetchBooks(page, rowsPerPage, authorSearch);
      console.log("Books Data:", booksData); // Debugging

      setTotalBooks(booksData.num_found);

      const booksWithAuthorDetails = await Promise.all(
        booksData.docs.map(async (book) => {
          const authorDetails = await fetchAuthorDetails(book.author_key[0]);
          console.log("Author Details:", authorDetails); // Debugging

          return {
            ...book,
            author_birth_date: authorDetails.birth_date || "N/A",
            author_top_work: authorDetails.top_work || "N/A",
            ratings_average: authorDetails.ratings_average || "N/A",
          };
        })
      );

      setBooks(booksWithAuthorDetails);
      console.log("Books with Author Details:", booksWithAuthorDetails); // Debugging
    };

    loadBooks();
  }, [authorSearch, page, rowsPerPage]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSearchByAuthor = (event) => {
    setAuthorSearch(event.target.value);
  };

  const handleSearchButtonClick = () => {
     setPage(1); // Reset to the first page on new search

     // Filter books based on author names
     const filteredBooks = books.filter((book) =>
       book.author_name.some(
         (author) =>
           author.toLowerCase().indexOf(authorSearch.toLowerCase()) !== -1
       )
     );

     setBooks(filteredBooks);
  };

  const handleEditClick = (book) => {
    setIsEditing(book.key);
    setEditedBook(book);
  };

  const handleSaveClick = () => {
    setBooks(
      books.map((book) => (book.key === editedBook.key ? editedBook : book))
    );
    setIsEditing(null);
  };

  const handleInputChange = (event, field) => {
    setEditedBook({ ...editedBook, [field]: event.target.value });
  };

  const downloadCSV = () => {
    const csvContent = [
      [
        "Title",
        "Author Name",
        "First Publish Year",
        "Subject",
        "Author Birth Date",
        "Author Top Work",
        "Ratings Average",
      ],
      ...books.map((book) => [
        book.title,
        book.author_name && book.author_name.join(", "),
        book.first_publish_year,
        book.subject && book.subject.join(", "),
        book.author_birth_date,
        book.author_top_work,
        book.ratings_average,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "books.csv");
    link.click();
  };

  const sortedBooks = [...books].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search by author"
        value={authorSearch}
        onChange={handleSearchByAuthor}
      />
      <button onClick={handleSearchButtonClick}>Search</button>
      <button onClick={downloadCSV}>Download CSV</button>
      <table>
        <thead>
          <tr>
            {[
              "title",
              "author_name",
              "first_publish_year",
              "subject",
              "author_birth_date",
              "author_top_work",
              "ratings_average",
            ].map((column) => (
              <th key={column} onClick={() => handleRequestSort(column)}>
                {column.replace("_", " ")}{" "}
                {orderBy === column ? (order === "asc" ? "↑" : "↓") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedBooks
            .slice((page - 1) * rowsPerPage, page * rowsPerPage)
            .map((book, index) => (
              <tr key={index}>
                {isEditing === book.key ? (
                  <>
                    <td>
                      <input
                        value={editedBook.title}
                        onChange={(e) => handleInputChange(e, "title")}
                      />
                    </td>
                    <td>
                      <input
                        value={editedBook.author_name}
                        onChange={(e) => handleInputChange(e, "author_name")}
                      />
                    </td>
                    <td>
                      <input
                        value={editedBook.first_publish_year}
                        onChange={(e) =>
                          handleInputChange(e, "first_publish_year")
                        }
                      />
                    </td>
                    <td>
                      <input
                        value={editedBook.subject}
                        onChange={(e) => handleInputChange(e, "subject")}
                      />
                    </td>
                    <td>
                      <input
                        value={editedBook.author_birth_date}
                        onChange={(e) =>
                          handleInputChange(e, "author_birth_date")
                        }
                      />
                    </td>
                    <td>
                      <input
                        value={editedBook.author_top_work}
                        onChange={(e) =>
                          handleInputChange(e, "author_top_work")
                        }
                      />
                    </td>
                    <td>
                      <input
                        value={editedBook.ratings_average}
                        onChange={(e) =>
                          handleInputChange(e, "ratings_average")
                        }
                      />
                    </td>
                    <td>
                      <button onClick={handleSaveClick}>Save</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{book.title}</td>
                    <td>{book.author_name && book.author_name.join(", ")}</td>
                    <td>{book.first_publish_year}</td>
                    <td>{book.subject && book.subject.join(", ")}</td>
                    <td>{book.author_birth_date}</td>
                    <td>{book.author_top_work}</td>
                    <td>{book.ratings_average}</td>
                    <td>
                      <button onClick={() => handleEditClick(book)}>
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          onClick={() => handleChangePage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.ceil(totalBooks / rowsPerPage)}
        </span>
        <button
          onClick={() => handleChangePage(page + 1)}
          disabled={page * rowsPerPage >= totalBooks}
        >
          Next
        </button>
        <select onChange={handleChangeRowsPerPage} value={rowsPerPage}>
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BookTable;
