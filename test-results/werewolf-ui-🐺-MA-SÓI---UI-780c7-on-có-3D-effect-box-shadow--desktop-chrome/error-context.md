# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: werewolf-ui.spec.cjs >> 🐺 MA SÓI - UI Mới >> 10. Premium button có 3D effect (box-shadow)
- Location: werewolf-ui.spec.cjs:122:3

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]: MA SÓI
    - generic [ref=e5]:
      - button "Toggle Theme" [ref=e6] [cursor=pointer]:
        - generic [ref=e7]: light_mode
      - button "Settings" [ref=e8] [cursor=pointer]:
        - generic [ref=e9]: settings
      - button "Help" [ref=e10] [cursor=pointer]:
        - generic [ref=e11]: help
      - button "Account" [ref=e12] [cursor=pointer]:
        - generic [ref=e13]: account_circle
  - generic [ref=e14]:
    - navigation [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]: NC
        - generic [ref=e18]:
          - heading "Người Chơi" [level=3] [ref=e19]
          - paragraph [ref=e20]: Cấp độ 15
      - link "home Trang chủ" [ref=e21] [cursor=pointer]:
        - /url: "#"
        - generic [ref=e22]: home
        - text: Trang chủ
      - link "swords Phòng chơi" [ref=e23] [cursor=pointer]:
        - /url: "#"
        - generic [ref=e24]: swords
        - text: Phòng chơi
      - link "group Bạn bè" [ref=e25] [cursor=pointer]:
        - /url: "#"
        - generic [ref=e26]: group
        - text: Bạn bè
      - link "shopping_bag Cửa hàng" [ref=e27] [cursor=pointer]:
        - /url: "#"
        - generic [ref=e28]: shopping_bag
        - text: Cửa hàng
      - generic [ref=e29]:
        - button "Nâng cấp Premium" [ref=e30] [cursor=pointer]
        - link "settings Cài đặt" [ref=e31] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e32]: settings
          - text: Cài đặt
        - link "logout Đăng xuất" [ref=e33] [cursor=pointer]:
          - /url: "#"
          - generic [ref=e34]: logout
          - text: Đăng xuất
    - main [ref=e35]:
      - generic [ref=e36]:
        - generic [ref=e37]:
          - heading "MA SÓI" [level=1] [ref=e38]
          - paragraph [ref=e39]: Social Deduction Game
          - generic [ref=e40]:
            - button "add_circle TẠO PHÒNG" [ref=e41] [cursor=pointer]:
              - generic [ref=e42]: add_circle
              - text: TẠO PHÒNG
            - button "search TÌM PHÒNG" [ref=e43] [cursor=pointer]:
              - generic [ref=e44]: search
              - text: TÌM PHÒNG
        - generic [ref=e46]:
          - heading "Phòng Đang Chờ" [level=2] [ref=e47]
          - button "refresh Làm mới" [ref=e48] [cursor=pointer]:
            - generic [ref=e49]: refresh
            - text: Làm mới
        - generic [ref=e50]:
          - generic [ref=e51]:
            - heading "Cửa Hàng Vật Phẩm" [level=2] [ref=e52]
            - link "Xem tất cả arrow_forward" [ref=e53] [cursor=pointer]:
              - /url: "#"
              - text: Xem tất cả
              - generic [ref=e54]: arrow_forward
          - generic [ref=e55]:
            - generic [ref=e56]:
              - generic [ref=e57]:
                - img "Nền Đêm Huyền Bí" [ref=e58]
                - generic [ref=e59]: 500 Vàng
              - generic [ref=e60]:
                - heading "Nền Đêm Huyền Bí" [level=3] [ref=e61]
                - button "shopping_cart Mua" [ref=e62] [cursor=pointer]:
                  - generic [ref=e63]: shopping_cart
                  - text: Mua
            - generic [ref=e64]:
              - generic [ref=e65]:
                - img "Nền Sáng Bình Minh" [ref=e66]
                - generic [ref=e67]: 500 Vàng
              - generic [ref=e68]:
                - heading "Nền Sáng Bình Minh" [level=3] [ref=e69]
                - button "shopping_cart Mua" [ref=e70] [cursor=pointer]:
                  - generic [ref=e71]: shopping_cart
                  - text: Mua
      - complementary [ref=e72]:
        - generic [ref=e73]:
          - heading "chat Kênh Thế Giới" [level=3] [ref=e74]:
            - generic [ref=e75]: chat
            - text: Kênh Thế Giới
          - generic [ref=e76]: 1.2k Online
        - generic [ref=e80]:
          - textbox "Nhập tin nhắn..." [ref=e81]
          - button "send" [ref=e82] [cursor=pointer]
```