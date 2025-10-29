[1]. Lấy danh sách các collection (gồm vocabulary và grammar) có mastery_score thấp và 1 số  collection có mastery_score cao truyền vào prompt (nếu có)
[2]. prompt sẽ nhận danh sách collection và tạo danh sách question với nhiều question_type khác nhau và 1 session. các question và session tạo ra đều lưu vào local storage app.
[3]. Session sẽ có 2 cơ chế tạo là auto và manually. auto là tạo tự động theo loop và thông báo với người dùng qua popup, notification. Loại "auto" thì người dùng có thể ko cần làm. "manually" thì sẽ tạo ở SessionManagerPage. khi tạo xong sẽ tự động đưa tới SessionPage để làm luôn
[4]. ở SessionPage. trong quá trình làm sẽ lưu tạm lịch sử trả lời của người dùng vào local storage app. sau khi làm xong sẽ gửi 1 prompt bao gồm danh sách question, danh sách user answer tương ứng và danh sách collection đã tồn tại trong vocabulary_item_ids và grammar_points. 
[5]. prompt sẽ trả về 1 danh sách collection bao gồm cả collection đã tồn tại và chưa tồn tại. đã tồn tại thì - mastery_score với - bao nhiêu điểm do gemini trả vê quyết định. chưa tồn tại thì chỉ cần tạo vào cloud database
[6]. Sau đó xóa session và question ra khỏi local storage

lưu ý:
[1]. Session chỉ có các field "id", "title", "question_ids", "created_at", "expires_at" và "difficulty_level". ko có các field như status hay complete_question... nên sẽ có có cac chức năng lấy danh sách pendingSession hay completeSession vì session đang tồn tại thì tức là nó pending. session đã hoàn thành thì sẽ bị xóa nên ko cần lưu status
[2]. trong quá trình làm session mà bỏ dỡ thì ko lưu các câu đã làm. vì ta ko cần lưu 2 trangj thái "đang làm dở" và "chưa làm". chỉ lưu 2 trangjthais là "chưa làm" * đang tồn tại và "đã làm xong" * bị xóa đi. ko cần lưu progress tạm thời. ko cần lưu lịch sử trả lời tạm thời. nếu user đóng app giữa chừng thì ko cần lưu lại
